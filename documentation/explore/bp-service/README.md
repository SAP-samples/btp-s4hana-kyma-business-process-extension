# Understand the Business Partner Service

The Business Partner service is the core of this extension application.
Whenever a new Business Partner is created in the SAP S/4HANA on-premise system, the business partner service is notified through an event from the event mesh, which is then processed by this service.

# How Does It Work?

The [SAP Cloud Application Programming Model (CAP)](https://cap.cloud.sap/docs/about/) is used to create the Business Partner Service. CAP automatically creates required queues and subscriptions in SAP Event Mesh via the configurations in `package.json(../../tree/main/package.json)` file.

Later, the events are consumed using [inbuilt APIs from CAP](https://cap.cloud.sap/docs/guides/messaging/#events-from-sap-s4hana).

[CAP CDS definition of service can be found here](https://github.com/SAP-samples/btp-s4hana-kyma-business-process-extension/blob/main/srv/service.cds)
