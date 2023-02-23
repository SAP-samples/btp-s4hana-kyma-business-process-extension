'use strict';
const qr = require('qrcode');
const axios = require("axios");
const util = require("./util");
const mock = require("./mock");
const { PassThrough } = require('stream');
const logger = require('cf-nodejs-logging-support');
logger.setLoggingLevel("info");
const axiosInstance = axios.create();


async function postImage(context, msg, event) {
        try{
            logger.info("msg in process.env", process.env);
            const destination = JSON.parse(JSON.parse(JSON.stringify(process.env.destination_credentials)))
            console.log(destination)
            const destinationNameFromContextString = process.env.destination_name;
            const destinationNameFromContext = JSON.parse(destinationNameFromContextString);
            const destinationName = destinationNameFromContext.name;
            const data = await util.readDetails(destination, destinationName, context, logger);
            var response = '';
            if (data.destinationConfiguration.ProxyType === "Internet") {
                response = await mock.processBpPayloadForInternet(data.destinationConfiguration, msg, destinationNameFromContext);
            } else{
                if(data.destinationConfiguration.CloudConnectorLocationId){
                    axiosInstance.defaults.headers.common['SAP-Connectivity-SCC-Location_ID'] = data.destinationConfiguration.CloudConnectorLocationId;
                }
                response = await processBpPayload(data.authTokens[0].value, data.destinationConfiguration, msg, destinationNameFromContext);
            }
            return response;
        }catch(error){
            throw error;
        }
}

async function processBpPayload(accessToken, destinationConfiguration, msg, destinationNameFromContext) {
        let bpDetails = msg.data;
        if (bpDetails.verificationStatus === "VERIFIED") {
            bpDetails.searchTerm1 = bpDetails.verificationStatus;
            bpDetails.businessPartnerIsBlocked = false;
        } else {
            bpDetails.searchTerm1 = bpDetails.verificationStatus;
            bpDetails.businessPartnerIsBlocked = true;
        }
        try{
            const headers = await fetchXsrfToken(destinationConfiguration, accessToken, bpDetails, destinationNameFromContext);
            if (bpDetails.addressModified && bpDetails.addressModified != undefined) {
                await updateBpAddress(destinationConfiguration, accessToken, headers, bpDetails, destinationNameFromContext);
                await updateBp(destinationConfiguration, accessToken, headers, bpDetails, destinationNameFromContext);
                if(!bpDetails.businessPartnerIsBlocked){
                   await postGeneratedImage(destinationConfiguration, accessToken, headers, bpDetails, destinationNameFromContext);
                    return "SUCCESS";
                }
                return "SUCCESS"; 
            } else {
                await updateBp(destinationConfiguration, accessToken, headers, bpDetails, destinationNameFromContext);
                if(!bpDetails.businessPartnerIsBlocked && bpDetails.addressId != undefined){
                    await postGeneratedImage(destinationConfiguration, accessToken, headers, bpDetails, destinationNameFromContext);
                    return "SUCCESS";
                }
                return "SUCCESS";
            }
        }catch(error){
            logger.info("error in process BP Payload", error);
            return error;
        }
}

async function fetchXsrfToken(destinationConfiguration, accessToken, bpDetails, destinationNameFromContext) {
    const businessPartnerSrvApi = destinationNameFromContext.businessPartnerSrvApi;
    const response =  await axiosInstance({
            method: 'get',
            url: destinationConfiguration.URL  + "/sap/opu/odata/sap/" + businessPartnerSrvApi+"/A_BusinessPartnerAddress",
            headers: {
                'Authorization': `Basic ${accessToken}`,
                'x-csrf-token': 'fetch'
            }
        }).catch(error => {
            logger.info("Error - Fetching CSRF token Error");
             logger.error(error);
            throw util.errorHandler(error, logger);
        });
    var cookies = '"';
    for (var i = 0; i < response.headers["set-cookie"].length; i++) {
        cookies += response.headers["set-cookie"][i] + ";";
    }
    cookies += '"';
    const headers = {
        token: response.headers['x-csrf-token'],
        cookie: cookies
    };
    logger.info("Success - Fetching CSRF Token : ");
    return headers;
}

async function updateBpAddress(destinationConfiguration, accessToken, headers, bpDetails, destinationNameFromContext) {
    const businessPartnerSrvApi = destinationNameFromContext.businessPartnerSrvApi;
    const response = await axiosInstance({
        method: 'patch',
        url: destinationConfiguration.URL + "/sap/opu/odata/sap/" + businessPartnerSrvApi+"/A_BusinessPartnerAddress(BusinessPartner='" + bpDetails.businessPartner + "',AddressID='" + bpDetails.addressId + "')",
        headers: {
            'Authorization': `Basic ${accessToken}`,
            'Content-Type': 'application/json',
            'x-csrf-token': headers.token,
            'Cookie': headers.cookie 
        },
        data: {
            "PostalCode": bpDetails.postalCode,
            "StreetName": bpDetails.streetName
        }
    }).catch(error => {
        logger.info("Error Updating BP Address", error);
        throw util.errorHandler(error, logger);
    });
    logger.info("SUCCESS - Updating BP Address");
}

async function updateBp(destinationConfiguration, accessToken, headers, bpDetails, destinationNameFromContext) {
    const businessPartnerSrvApi = destinationNameFromContext.businessPartnerSrvApi;
    const response = await axiosInstance({
        method: 'patch',
        url: destinationConfiguration.URL + "/sap/opu/odata/sap/" + businessPartnerSrvApi+ "/A_BusinessPartner('" + bpDetails.businessPartner + "')",
        headers: {
            'Authorization': `Basic ${accessToken}`,
            'Content-Type': 'application/json',
            'x-csrf-token': headers.token,
            'Cookie': headers.cookie
        },
        data: {
            "SearchTerm1": bpDetails.searchTerm1,
            "BusinessPartnerIsBlocked": bpDetails.businessPartnerIsBlocked
        }
    }).catch(error => {
        logger.info("Error in Updating BP");
        throw util.errorHandler(error, logger);
    });
    logger.info("Success - Updating BP");
}

async function postGeneratedImage(destinationConfiguration, accessToken, headers, bpDetails, destinationNameFromContext) {
    const attachmentSrvApi = destinationNameFromContext.attachmentSrvApi;
    const businessObjectTypeName = destinationNameFromContext.businessObjectTypeName;
        return await generateQRCode(bpDetails).then(async image =>{
                const bp = bpDetails.businessPartner;
                const response =  await axiosInstance({
                    method: 'post',
                    url: destinationConfiguration.URL + "/sap/opu/odata/sap/" + attachmentSrvApi+ "/AttachmentContentSet",
                    headers: {
                        'Authorization': `Basic ${accessToken}`,
                        'Content-Type': 'Image/jpg',
                        'Slug': bp + '.jpg',
                        'BusinessObjectTypeName': businessObjectTypeName,
                        'LinkedSAPObjectKey': bp.padStart(10,0),
                        'x-csrf-token': headers.token,
                        'Cookie': headers.cookie
                    },
                    data: image,
                }).catch(error => {  
                    logger.info("ERROR - Uploading Image");
                    throw util.errorHandler(error, logger);
                });
                    logger.info("SUCCESS - Uploading Image");
            }).catch(error => {
                logger.info("ERROR - uploading image");
                throw error;
            });
}

function generateQRCode(bpDetails){
    return new Promise(function (resolve, reject) {
        let imageData = {
            businessPartner: bpDetails.businessPartner,
            businessPartnerName: bpDetails.businessPartnerName,
            addressId: bpDetails.addressId,
            streetName: bpDetails.streetName,
            country: bpDetails.country,
            postalCode: bpDetails.postalCode
        }

        const stream = new PassThrough();
        qr.toFileStream(stream, JSON.stringify(imageData));
        let chunks = [];
        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        let image;
        stream.on('end',  () =>{
            image = Buffer.concat(chunks);
            resolve(image);
        });

        stream.on("error", error => {
            logger.info("ERROR - QR Code generation");
            reject(new Error("ERROR - Generating QR Code"));
        });
    });
}

module.exports = {
    postImage
};
