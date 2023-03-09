

module.exports = async srv => {
  const { BusinessPartnerAddress, Notifications, Addresses, BusinessPartner } = srv.entities;
  const axios = require('axios');
  const bupaSrv = await cds.connect.to("API_BUSINESS_PARTNER");
  const messaging = await cds.connect.to('messaging')
  const { postcodeValidator } = require('postcode-validator');
  const { HTTP, CloudEvent } = require("cloudevents");
  const LOG = cds.log('kyma-service')

  srv.on("READ", BusinessPartnerAddress, req => bupaSrv.run(req.query))
  srv.on("READ", BusinessPartner, req => bupaSrv.run(req.query))
  //works locally
  messaging.on(`ce/sap/s4/beh/businesspartner/v1/BusinessPartner/Created/v1`, async msg => {
      const BUSINESSPARTNER = msg.data.BusinessPartner
      const bpEntity = await bupaSrv.run(SELECT.one(BusinessPartner).where({ businessPartnerId: BUSINESSPARTNER }));
      LOG.debug("bpEntity", bpEntity);
      const result = await cds.run(INSERT.into(Notifications).entries({ businessPartnerId: BUSINESSPARTNER, verificationStatus_code: 'N', businessPartnerName: bpEntity.businessPartnerName }));
      const address = await bupaSrv.run(SELECT.one(BusinessPartnerAddress).where({ businessPartnerId: BUSINESSPARTNER }));
      // for the address to notification association - extra field
      if (address) {
        LOG.info("Address recieved");
        LOG.debug("Received address is", address);
        const notificationObj = await cds.run(SELECT.one(Notifications).columns("ID").where({ businessPartnerId: BUSINESSPARTNER }));
        address.notifications_ID = notificationObj.ID;
        const res = await cds.run(INSERT.into(Addresses).entries(address));
        LOG.info("Address inserted");
      }
  });

  messaging.on(`ce/sap/s4/beh/businesspartner/v1/BusinessPartner/Changed/v1`, async msg => {
      const BUSINESSPARTNER = msg.data.BusinessPartner
      LOG.info("BUSINESSPARTNER", BUSINESSPARTNER);
      const bpIsAlive = await cds.run(SELECT.one(Notifications, (n) => n.verificationStatus_code).where({ businessPartnerId: BUSINESSPARTNER }));
      if (bpIsAlive && bpIsAlive.verificationStatus_code == "V") {
        const bpMarkVerified = await cds.run(UPDATE(Notifications).where({ businessPartnerId: BUSINESSPARTNER }).set({ verificationStatus_code: "C" }));
      }
      LOG.info("<< Business Partner marked verified >>");
  });

  srv.after("UPDATE", "Notifications", async (data, req) => {
    LOG.info("Notification update", data.businessPartnerId);
    if (data.verificationStatus_code === "V" || data.verificationStatus_code === "INV")
      await emitEvent(data, req);
  });

  srv.before("SAVE", "Notifications", req => {
    if (req.data.verificationStatus_code == "C") {
      req.error({ code: '400', message: "Cannot mark as COMPLETED. Please change to VERIFIED", numericSeverity: 2, target: 'verificationStatus_code' });
      LOG.debug("Invalid status transition to COMPLETED");
    }
  });

  srv.before("PATCH", "Addresses", req => {
    // To set whether address is Edited
    req.data.isModified = true;
  });

  srv.after("PATCH", "Addresses", (data, req) => {
    LOG.info("Received address in PATCH", data);
    var isValidPinCode = true;
    if(data.postalCode){
      isValidPinCode = validatePostcode(data);
    }
    if (!isValidPinCode) {
      LOG.debug("Invalid postal code has been provided");
      return req.error({ code: '400', message: "invalid postal code", numericSeverity: 2, target: 'postalCode' });
    }
    return req.info({ numericSeverity: 1, target: 'postalCode' });
  });

  async function validatePostcode(data){
    var isValidPinCode;
    if(data.postalCode){
      LOG.info("data", data);
      const address = await SELECT.one(Addresses).where({ ID: data.ID });
      isValidPinCode = postcodeValidator(data.postalCode, address.country);
      LOG.info("isValidPinCOde",isValidPinCode);
      return isValidPinCode;
    }
  }

  async function emitEvent(result, req) {
    LOG.info("emit event");
    const resultJoin = await cds.run(SELECT.one("my.businessPartnerValidation.Notifications as N").leftJoin("my.businessPartnerValidation.Addresses as A").on("N.businessPartnerId = A.businessPartnerId").where({ "N.ID": result.ID }));
    const statusValues = { "N": "NEW", "P": "PROCESS", "INV": "INVALID", "V": "VERIFIED" }
    // Format JSON as per serverless requires
    const payload = new CloudEvent({
      type: "sap.kyma.custom.internal.bp.notification.v1",
      source: "/default/bp.ems/bpems",
      data: {
          "businessPartner": resultJoin.businessPartnerId,
          "businessPartnerName": resultJoin.businessPartnerName,
          "verificationStatus": statusValues[resultJoin.verificationStatus_code],
          "addressId": resultJoin.addressId,
          "streetName": resultJoin.streetName,
          "postalCode": resultJoin.postalCode,
          "country": resultJoin.country,
          "addressModified": resultJoin.isModified
      },
      datacontenttype: "application/json"
    });
    const message = HTTP.structured(payload);
    console.log("after sending payload");
    console.log(`ce: ${JSON.stringify(message)}`);
    // console.log(`printing content type ${JSON.stringify(message.headers['content-type'])}`);

    const response = await axios({
      method: 'post',
      url: process.env.PUBLISHER_URL,
      headers: message.headers,
      data: message.body
  }).catch(error => {
      LOG.info("Error in post", error);
      // throw util.errorHandler(error, logger);
  });
    LOG.info(`Message emitted to Queue`);
    return {"status": "published"};
  }

}

