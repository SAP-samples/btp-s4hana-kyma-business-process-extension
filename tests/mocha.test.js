// Payload for BP Creation, ensure it's unique 
let id = new Date().getTime().toString().slice(0,9);
var payload = {
  "BusinessPartner": id,
  "BusinessPartnerIsBlocked": true,
  "BusinessPartnerFullName": "White Sky"
};
const chai = require('chai');
const chaiHttp = require('chai-http');
const config = require("./testscripts/util/config");
let xsuaa_access_token;
let BPNotificationID;
chai.use(chaiHttp);
chai.should();
var expect = chai.expect;
describe("Get Access Token from XSUAA", () => {
  it("should fetch bearer token", (done) => {
    let requestHeaders = { 'Content-Type': 'application/x-www-form-urlencoded' };
    chai.request(config.token_url).post("/oauth/token").set(requestHeaders).send(config.xsuaa)
      .end((err, response) => {
        try {
          expect(response).to.be.a("Object");
          xsuaa_access_token = response.body.access_token;
          done();
        } catch (err) {
          console.error(err);
          done(err);
        }
      });
  });
});
describe("Read Business partners", () => {
  it("Should load notifications", (done) => {
    chai.request(config.service_domain).get("sales/Notifications?$top=1").set('Authorization', 'bearer ' + xsuaa_access_token).end((err, response) => {
      try {
       // console.log("response",response);
        response.should.have.status(200);
        done();
      } catch (err) {
        console.error(err);
        done(err);
      }
    });
  });
});

describe("BP is created and Notification is recieved", () => {
  it("Should Create BP in mock application", (done) => {
    let header = {
      "Content-Type": "application/json"
    };
    chai.request(config.mock.url).post("sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner").set(header).send(payload)
      .end((err, res) => {
        try {
          res.should.have.status(201);
          done();
        } catch (err) {
          console.error(err);
          done(err)
        }
      });
  });

});

describe("Load Created BP ", () => {
  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
    it(`Load BP ${payload.BusinessPartner}`, (done) => {
      sleep(10000).then(() => {
      chai.request(config.service_domain).get("sales/Notifications").query(`$filter=(businessPartnerId eq '${payload.BusinessPartner}')`)
        .set('Authorization', 'bearer ' + xsuaa_access_token).end((err, response) => {
          try {
            //response.body.value.should.have.lengthOf(1);
            response.body.value[0].should.be.a("Object");
            BPNotificationID = response.body.value[0].ID
            console.info(BPNotificationID);
            done();
            runNext();
          } catch (err) {
            console.error(err);
            done(err)
          }
        });
    });
  });

});
function runNext() {

  describe("Handle Draft", () => {
    it("Enable darft", (done) => {
      let headers = {
        "Content-Type": "application/json",
        "Authorization": "bearer " + xsuaa_access_token
      };
      chai.request(config.service_domain).post(`sales/Notifications(ID=${BPNotificationID},IsActiveEntity=true)/service.businessPartnerValidation.SalesService.draftEdit?$select=HasActiveEntity,HasDraftEntity,ID,IsActiveEntity,businessPartnerId,businessPartnerName,verificationStatus_code&$expand=DraftAdministrativeData($select=DraftUUID,InProcessByUser),verificationStatus($select=code,updateCode)`)
        .set(headers).send({ "PreserveChanges": true }).end((err, response) => {
          try {
            response.should.have.status(201);
            done();
          } catch (err) {
            console.error(err);
            done(err);
          }
        });

    });
    it("Check for Active entity", (done) => {
      let headers = {
        "Authorization": "bearer " + xsuaa_access_token
      };
      chai.request(config.service_domain).get(`sales/Notifications(ID=${BPNotificationID},IsActiveEntity=false)`)
        .set(headers).end((err, response) => {
          try {
            response.should.have.status(200);
            done();
          } catch (err) {
            console.error(err);
            done(err);
          }
        });

    });
    it("Payload for varification Status", (done) => {
      let headers = {
        "Content-Type": "application/json",
        "Authorization": "bearer " + xsuaa_access_token
      };
      chai.request(config.service_domain).patch(`sales/Notifications(ID=${BPNotificationID},IsActiveEntity=false)`)
        .set(headers).send({ "verificationStatus_code": "V" }).end((err, response) => {
          try {
            response.should.have.status(200);
            done();
          } catch (err) {
            console.error(err);
            done(err);
          }
        });

    });
    it("Side Effect Check", (done) => {
      let headers = {
        "Content-Type": "application/json",
        "Authorization": "bearer " + xsuaa_access_token
      };
      chai.request(config.service_domain).post(`sales/Notifications(ID=${BPNotificationID},IsActiveEntity=false)/service.businessPartnerValidation.SalesService.draftPrepare`)
        .set(headers).send({ "SideEffectsQualifier": "" }).end((err, response) => {
          try {
            response.should.have.status(200);
            done();
          } catch (err) {
            console.error(err);
            done(err);
          }
        });

    });
    it("Publish Draft", (done) => {
      let headers = {
        "Content-Type": "application/json",
        "Authorization": "bearer " + xsuaa_access_token
      };
      chai.request(config.service_domain).post(`sales/Notifications(ID=${BPNotificationID},IsActiveEntity=false)/service.businessPartnerValidation.SalesService.draftActivate`)
        .set(headers).send({ "SideEffectsQualifier": "" }).end((err, response) => {
          try {
            response.should.have.status(201);
            done();
          } catch (err) {
            console.error(err);
            done(err);
          }
        });
    });
  });

  describe("Confirm varification Status", () => {
    it("Confirm Published Status", (done) => {
      let headers = {
        "Authorization": "bearer " + xsuaa_access_token
      };
      chai.request(config.service_domain).get(`sales/Notifications(ID=${BPNotificationID},IsActiveEntity=true)`)
        .set(headers).end((err, response) => {
          try {
            expect(response.body.verificationStatus_code).to.equal("V");
            done();
          } catch (err) {
            console.error(err);
            done(err);
          }
        });
    });
  });


  describe("Change Status to Confirmed", () => {
    it("Change status in mock app", (done) => {
      chai.request(config.mock.url).put(`sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('${payload.BusinessPartner}')`)
        .send({ "BusinessPartnerIsBlocked": false })
        .end((err, response) => {
          try {
            expect(response.body.BusinessPartnerIsBlocked).to.equal(false);
            done();
          } catch (err) {
            console.error(err);
            done(err);
          }
        });
    });
  });

  describe("Check Final Status", () => {
    const sleep = (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    }
    it(`Check Changed status in Service ${payload.BusinessPartner}`, (done) => {
      sleep(8000).then(()=>{
        chai.request(config.service_domain).get("sales/Notifications").query(`$filter=(businessPartnerId eq '${payload.BusinessPartner}')`)
        .set('Authorization', 'bearer ' + xsuaa_access_token).end((err, response) => {
          try {
            expect(response.body.value[0].verificationStatus_code).to.equal("C");
            done();
          } catch (err) {
            console.error(err);
            done(err)
          }
        });
      });
    });
  });
}
