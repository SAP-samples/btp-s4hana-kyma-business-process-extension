const cred =  require("./appenv");
const domain = "aaee644.kyma.ondemand.com";
console.log("bfr credentials")
const credentialsTemp = Buffer.from(cred.data.credentials, 'base64').toString()
console.log("credentialsTemp", credentialsTemp)
const credentials =JSON.parse(credentialsTemp)
console.log("credentials", credentials)
const apiurl = credentials.url
console.log("apiurl", apiurl)
const clientid = credentials.clientid
const clientsecret = credentials.clientsecret
console.log("clientsecret", clientsecret)
module.exports = {
    "token_url": apiurl.toString(),
    "service_domain": "https://s4kymarelease-srv-cicdkyma."+domain+"/",
    "xsuaa": {
        "grant_type": "client_credentials",
        "client_id": clientid.toString(),
        "client_secret": clientsecret.toString(),
    },
    "mock": {
        "url": "https://s4kymamock-srv-cicdkyma."+domain+"/"
    }
}
