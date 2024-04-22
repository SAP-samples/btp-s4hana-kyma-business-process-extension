const cds = require ('@sap/cds')
// const proxy = require("@sap/cds-odata-v2-adapter-proxy");
const customIndexJS = require ('./customIndex.js')
module.exports = cds.server

const cds_swagger = require ('cds-swagger-ui-express')
cds.on ('bootstrap', app => app.use (cds_swagger()) )

cds.on('bootstrap', app => {
    app.get ('/', (_,res) => res.send (customIndexJS.html)) 
  })

cds.on("bootstrap", app => {
    app.post("/sap/opu/odata/sap/API_CV_ATTACHMENT_SRV/AttachmentContentSet", (req, res)=>{

        console.log("Received image")

        res.sendStatus(201);

    })

})
