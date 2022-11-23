const axios = require("axios");
let serverlessConfigurationsDone = false;

async function emConfiguration(credentials){
    const isQueueAvailable = await checkIfServerlessQueueAvailable(credentials);
    return isQueueAvailable;
}

async function checkIfServerlessQueueAvailable(credentials){
  const tokenOptionsData = await tokenOptions(credentials);
  await axios(tokenOptionsData).then(async response => {
    const token = response.data.access_token;
    const url = credentials.management[0].uri
    const namespace = credentials.namespace;
    const queue = namespace + "/serverless";
    await axios({
        method: 'get',
        url: `${url}/hub/rest/api/v1/management/messaging/queues/${encodeURIComponent(queue)}`,
        headers: {
            'Authorization': 'Bearer ' + token
        }
    }).then(response => {
      console.log("success in getting queue");
      return true;
    }).catch(async error => {
    console.log("error in gettingqueue");
    await serverlessQueueConfigurations(credentials);
    return "Queue Created";
  })
}).catch(error => {
  console.log("error in fetching token", error);
  throw error;
})
}

async function serverlessQueueConfigurations(credentials){
      const tokenOptionsData = await tokenOptions(credentials);
      await axios(tokenOptionsData).then(async response => {
          const token = response.data.access_token;
          const queueCreationOptionsData = await queueCreationOptions(token, credentials);
          await axios(queueCreationOptionsData).then(async response =>{
                console.log("success inside queue creation");
                const topicSubscriptionOptionsData = await topicsSubscriptionOptions(token, credentials);
                await axios(topicSubscriptionOptionsData).then(async response => {
                  console.log("success subscribing to topic");
                  const webhookCreationOptionsData = await webhookCreationOptions(token, credentials);
                  console.log("webhookcreationoptions-----", webhookCreationOptionsData);
                  await axios(webhookCreationOptionsData).then(response => {
                    console.log("success inside webhook subscription");
                    return "SUCCESS";
                  }).catch(error => {
                    console.log("error in webhook subscription", error);
                    throw error;
                    });
                }).catch(error => {
                console.log("error in topic subscription", error);
                throw error;
                });
          }).catch(error => {
              console.log("error in queue creation", error);
              throw error;
          });
      }).catch(error => {
        console.log("error in fetching xsrf token", error);
        throw error;
      });
    }

    async function tokenOptions(credentials){
      const tokenEndpoint = credentials.management[0].oa2.tokenendpoint;
      const clientId = credentials.management[0].oa2.clientid
      const clientSecret = credentials.management[0].oa2.clientsecret
      let tokenOptions1 = {
        method: "POST",
        url: `${tokenEndpoint}?grant_type=client_credentials&response_type=token`,
        headers: {
            'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
        }
      };
      return tokenOptions1;
    }

    async function queueCreationOptions(token, credentials){
      const url = credentials.management[0].uri
      const namespace = credentials.namespace;
      const queue = namespace + "/serverless";
      let queueCreationOptions1 = {
        method: "PUT",
        url: `${url}/hub/rest/api/v1/management/messaging/queues/${encodeURIComponent(queue)}` ,
        headers: {
            'Authorization': 'Bearer ' + token,
            "Content-Type": "application/json",
            "accept": "application/json"
        }
      };
      return queueCreationOptions1;
    }

    async function topicsSubscriptionOptions(token, credentials){
      const url = credentials.management[0].uri
      const namespace = credentials.namespace;
      const queue = namespace + "/serverless";
      const topic = namespace + "/SalesService/d41d/BusinessPartnerVerified";
      let topicsSubscriptionOptions1 = {
        method: "PUT",
        url: `${url}/hub/rest/api/v1/management/messaging/queues/${encodeURIComponent(queue)}/subscriptions/${encodeURIComponent(topic)}`,
        headers: {
            'Authorization': 'Bearer ' + token,
            "Content-Type": "application/json",
            "accept": "application/json"
        }
      };
      return topicsSubscriptionOptions1;
    }

    async function webhookCreationOptions(token, credentials){
      const url = credentials.messaging[2].uri
      const namespace = credentials.namespace;
      const queue = namespace + "/serverless";
      let webhookCreationOptions1 = {
        method: "POST",
        url: `${url}/messagingrest/v1/subscriptions`,
        headers: {
          'Authorization': 'Bearer ' + token,
          "Content-Type": "application/json"
        },
        data: {
          "name": "qrcodegenerator",
          "address": `queue:${queue}`,
          "qos": 0,
          "pushConfig": {
              "type": "webhook",
              "endpoint": process.env.SERVERLESS_URL,
              "exemptHandshake": true
          }
        }
      };
      return webhookCreationOptions1;
    }

    module.exports = {
        emConfiguration
    };