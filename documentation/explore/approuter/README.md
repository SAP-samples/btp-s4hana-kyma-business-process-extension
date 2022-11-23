# Understand the Approuter

When a business application consists of several different applications (microservices), the application router is used to provide a single entry point to that business application. It has the responsibility to:

- Dispatch requests to backend microservices (reverse proxy)
- Authenticate users
- Serve static content

See [`@sap/approuter`](https://www.npmjs.com/package/@sap/approuter) on npm for more details.


To run the Approuter locally, you need to create a file named `default-env.json` at the root of the project. The file has `VCAP_Services` with service keys under it. This can be obtained by deploying the Approuter application along with its dependent services in the Cloud Foundry environment.

## Configurations

[`xs-app.json`](https://www.npmjs.com/package/@sap/approuter#xs-appjson-configuration-file) is used to configure different routes for the application.
