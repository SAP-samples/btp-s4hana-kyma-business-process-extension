const cds = require('@sap/cds')
const emutil = require("./em");
// react on bootstrapping events...
cds.on('served', ()=>{
    const vcap = JSON.parse(process.env.VCAP_SERVICES);
    const emjson = vcap["enterprise-messaging"]
    const credentials = emjson[0].credentials
    emutil.emConfiguration(credentials);
});
module.exports = cds.server