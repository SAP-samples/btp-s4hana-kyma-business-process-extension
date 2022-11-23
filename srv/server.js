const cds = require('@sap/cds')
const emutil = require("./em");
// react on bootstrapping events...
cds.on('served', ()=>{
    console.log("inside cds.on");
    const vcap = JSON.parse(process.env.VCAP_SERVICES);
    console.log("inside vcap");
    const emjson = vcap["enterprise-messaging"]
    console.log("emjson ",emjson);
    const credentials = emjson[0].credentials
    emutil.emConfiguration(credentials);
});
module.exports = cds.server