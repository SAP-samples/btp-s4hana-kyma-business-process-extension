# Understand the QRCode Generator

The QRCode generator is a serverless function.
As and when the Business Partner is verified in the extension application, an event is received by the serverless function, which is then processed to generate the QR code for the updated Business Partner address.

The serverless function then updates the Business Partner, and the Business Partner address verifies the Business Partner and also attaches the generated QRcode to the attachments in the SAP S/4HANA on-premise system.

The events are delivered to serverless function by event-mesh via webhooks.

[QR Code Generator implementation](https://github.com/SAP-samples/btp-s4hana-kyma-business-process-extension/tree/main/qrcodegenerator)
