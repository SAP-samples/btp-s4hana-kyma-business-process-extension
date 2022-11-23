const axios = require("axios");
const oauth = require("./oauth");
async function readDetails(destination, destinationName, context, logger) {
        try{
            console.log("read details", destination);
            const destinationConfiguration = await readDestinationUrl(destination, destinationName, logger);
            return destinationConfiguration;
        }catch(error) {
            return error;
        }
}

async function readDestinationUrl(destination, destinationName, logger) {
        try{
            const credentials = getCredentials(destination, logger);
            const access_token = await oauth.token(credentials, logger);
            const destinationConfiguration = await getDestination(access_token, destination, destinationName, logger);
            return(destinationConfiguration);
        }catch(error) {
            throw error;
        }
}

function getCredentials(destination, logger) {
    console.log("inside getCredentials", destination.clientid);
    try {
        const credentials = {
            clientid: destination.clientid,
            clientsecret: destination.clientsecret,
            url: destination.url
        };
            console.log("inside credentials ",credentials);
        return credentials;
    } catch (error) {
        logger.info("error in getCredentials");
        throw errorHandler(error, logger);
    }
}

async function getDestination(access_token, destination, destinationName, logger) {
    if(!destinationName){
        destinationName ="gopalkyma2-s4apiaccess";
    }
    return await axios({
            method: 'get',
            url: `${destination.uri}/destination-configuration/v1/destinations/${destinationName}`,
            headers: {
                'Authorization': `Bearer ${access_token}`
            },
            json: true,
      }).then(function (response) {
        console.log(`Response data`, response.data);
        return response.data;
        
      }).catch(function (error) {
          logger.info("error in getdestination");
          throw errorHandler(error, logger);
      }); 
}

function errorHandler(error, logger){
    if(error.response){
        if(error.response.data.error === undefined){}
        else{
            logger.info("error handler - error.response");
            let errorResponse = JSON.stringify(error.response.data.error);
            return new Error(errorResponse);
        }
      }if(error.Error){
        logger.info("error handler - error.error");
        let errorResponse = error.Error;
        return new Error(errorResponse);
      }else{
        logger.info("error handler - else");
        let errorResponse = "Error - Please contact the System Administrator for more details";
        return new Error(errorResponse);
      }
}

module.exports = {
    readDetails,
    errorHandler
};
