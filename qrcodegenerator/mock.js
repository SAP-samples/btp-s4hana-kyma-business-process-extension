'use strict';
const qr = require('qrcode');
const axios = require("axios");
const util = require("./util");
const mock = require("./mock");
const { PassThrough } = require('stream');
const logger = require('cf-nodejs-logging-support');
logger.setLoggingLevel("info");

async function processBpPayloadForInternet(destinationConfiguration, msg, destinationNameFromContext) {
        let bpDetails = msg;
        if (bpDetails.verificationStatus === "VERIFIED") {
            bpDetails.searchTerm1 = bpDetails.verificationStatus;
            bpDetails.businessPartnerIsBlocked = false;
        } else {
            bpDetails.searchTerm1 = bpDetails.verificationStatus;
            bpDetails.businessPartnerIsBlocked = true;
        }
        try{
            if (bpDetails.addressModified && bpDetails.addressModified != undefined) {
                await updateBpAddress(destinationConfiguration, bpDetails, destinationNameFromContext);
                await updateBp(destinationConfiguration, bpDetails, destinationNameFromContext);
                if(!bpDetails.businessPartnerIsBlocked){
                   await postGeneratedImage(destinationConfiguration, bpDetails, destinationNameFromContext);
                   return "SUCCESS";
                }
                return "SUCCESS"; 
            } else {
                await updateBp(destinationConfiguration, bpDetails, destinationNameFromContext);
                if(!bpDetails.businessPartnerIsBlocked && bpDetails.addressId != undefined){
                    await postGeneratedImage(destinationConfiguration, bpDetails, destinationNameFromContext);
                    return "SUCCESS";
                }
                return "SUCCESS";
            }
        }catch(error){
            logger.info("error in process BP Payload", error);
            return error;
        }
}

async function updateBpAddress(destinationConfiguration, bpDetails, destinationNameFromContext) {
    const businessPartnerSrvApi = destinationNameFromContext.businessPartnerSrvApi;
    const response = await axios({
        method: 'patch',
        url: destinationConfiguration.URL + "/sap/opu/odata/sap/" + businessPartnerSrvApi+"/A_BusinessPartnerAddress(BusinessPartner='" + bpDetails.businessPartner + "',AddressID='" + bpDetails.addressId + "')",
        headers: {
            'Content-Type': 'application/json'
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

async function updateBp(destinationConfiguration, bpDetails, destinationNameFromContext) {
    const businessPartnerSrvApi = destinationNameFromContext.businessPartnerSrvApi;
    const response = await axios({
        method: 'patch',
        url: destinationConfiguration.URL + "/sap/opu/odata/sap/" + businessPartnerSrvApi+ "/A_BusinessPartner('" + bpDetails.businessPartner + "')",
        headers: {
            'Content-Type': 'application/json',
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

async function postGeneratedImage(destinationConfiguration, bpDetails, destinationNameFromContext) {
    const attachmentSrvApi = destinationNameFromContext.attachmentSrvApi;
    const businessObjectTypeName = destinationNameFromContext.businessObjectTypeName;
        return await generateQRCode(bpDetails).then(async image =>{
                const bp = bpDetails.businessPartner;
                const response =  await axios({
                    method: 'post',
                    url: destinationConfiguration.URL + "/sap/opu/odata/sap/" + attachmentSrvApi+ "/AttachmentContentSet",
                    headers: {
                        'Content-Type': 'Image/jpg',
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
    processBpPayloadForInternet
};
