# OData Mock Server

This is a Mock Server for OData API's (e.g. from S/4HANA, ECC etc.).

This project implies to work as SAP S/4HANA Cloud Mock backend server for the Reference Applications use cases. The project is built on Cloud Application Programming ([CAP](https://cap.cloud.sap/docs/)) model with mocking capabilities.

## Why to use

1. Speed up mission implementation. SAP Customer can get an overview of the scenario even without ERP/Cloud Connector configuration.
2. Troubleshooting. If something goes wrong it's nice to have an opportunity to limit the scope for cloud services only.
3. Automated integration/E2E tests.

## Features

General features:
- Simplified SAP S/4HANA mock server APIs with Business Partner and Business Partner Address entity
- OData Endpoints for both versions - [V2](https://cap.cloud.sap/docs/advanced/odata#v2-support) and V4
- CSV files for [mock data](https://cap.cloud.sap/docs/guides/using-services#local-mocking)
- [Event emitting](https://cap.cloud.sap/docs/guides/messaging/#using-sap-event-mesh) on [data change](https://cap.cloud.sap/docs/guides/providing-services#registering-event-handlers)
- Enhancement possibilities (adding new services)
- In-memory [SQLite DB](https://cap.cloud.sap/docs/guides/databases#deploy-to-sqlite) is used (no DB instance is needed -> low cost, no dependencies)
- [SwaggerUI](https://cap.cloud.sap/docs/advanced/openapi#swagger-ui)
- Hybrid testing with Event Mesh [test](https://cap.cloud.sap/docs/advanced/hybrid-testing)

## Prerequisites

To deploy the mock server application it's necessary to have a SAP BTP Kyma runtime.

## Quick deploy in SAP BTP Kyma Environment

1. Clone the mock server using the branch `mockserver`:

	```
	git clone https://github.com/SAP-samples/btp-s4hana-kyma-business-process-extension.git -b mockserver
	```
	
2. Navigate to root folder in the cloned source code and run the following commands to build and push the docker image

    ```shell  
    cds build --production
    pack build kymamock --path gen/srv --builder paketobuildpacks/builder:base
    docker tag mock:latest <DOCKER_ACCOUNT>/kymamock:latest
    docker push <DOCKER_ACCOUNT>/kymamock:latest
    ```

3. Navigate to the charts folder in the cloned source code.

4. Edit the domain of your cluster, so that the URL of your CAP service can be generated. You can use the preconfigured domain name for your Kyma cluster:

    ```shell  
    kubectl get gateway -n kyma-system kyma-gateway -o jsonpath='{.spec.servers[0].hosts[0]}'
    ```
5. Find all <DOCKER_ACCOUNT> and replace all with your docker account/repository.

6.  For a private container registry - Create a secret for your Docker repository and replace the value of DOCKER_SECRET with the created secret name.
   
    imagePullSecret: name: <DOCKER_SECRET>

7. Find all <RELEASE_NAME_OF_KYMAAPP> and replace all with the release name of your deployed [CAP on Kyma](https://github.com/SAP-samples/btp-s4hana-kyma-business-process-extension/blob/main/documentation/deploy/deploy/README.md) application.

**Note:** Please make sure that you deploy the mock server to the same namespace where the Kyma application have been deployed.

8. Run the following command to deploy your application

    ```shell 
    helm upgrade --install <RELEASE_NAME> ./chart -n <NAMESPACE>

## How to use

1. After the successful deployment you will get the following message:

    <code>Application "mock-srv" started and available at "..."</code>

2. Follow the given URL to get the CAP App Index Page. You can find *'/op-api-business-partner-srv'* link there. This URL can be used as OData V4 Endpoint. Use this URL in the corresponding destination for your mission.

3. If you need V2 Endpoint please add '/v2' to the endpoint URL to get something like that:

    <code>https://someDomain/v2/op-api-business-partner-srv</code>

3. On the index page there is also a link to SwaggerUI: *Open API Preview*. Open it and go to the section *POST /A_BusinessPartner*. Click the button *Try it out*. Use the following JSON as a payload (replace the proposed one):

```
    {  
	"BusinessPartner": "555",  
	"BusinessPartnerName": "Max Mustermann",  
	"BusinessPartnerFullName": "Max Mustermann",  
	"FirstName": "Max",  
	"LastName": "Mustermann",  
	"BusinessPartnerIsBlocked": true,  
	"to_BusinessPartnerAddress": [{  
        "BusinessPartner": "555",  
		"AddressID": "1",  
		"StreetName": "Platz der Republik",  
		"HouseNumber": "1",  
		"PostalCode": "10557",  
		"CityName": "Berlin",  
		"Country": "DE"  
		}]  
    }
```    

4. Click *Execute*. You should get a response with the code 201. This means that the entry was created in the database and the corresponding event was triggered (if the Event Mesh instance is binded).

## Hybrid test

With the hybrid testing capabilities, you stay in your local development environment and avoid long turn-around times of cloud deployment and you can use Event Mesh instance from the cloud.

It's assumed that the Event Mesh service and its key is already created beforehand.

Before the test you should be logged in to the Cloud Foundry Environment. To do it use *Ctrl+Shift+P* and select *CF: Login To Cloud Foundry*. Follow the next instructions on the screen.

To bind the Event Mesh service use the following command in terminal:

<code>cds bind messaging -2 BusinessPartnerValidation-ems:emkey</code>

After that the file *.cdsrc-private.json* will be created/updated with the corresponding information.

To start the Mock Server in hybrid mode use the following command:

<code>cds watch --profile hybrid</code>

## Project Structure

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`img/` | images for README.md
`srv/` | service models and CSV data
`package.json` | project metadata and configuration
`readme.md` | this getting started guide
`mta.yaml` | ...
`server.js` | ...


- Open a new terminal and run `cds watch` 
- (in VS Code simply choose _**Terminal** > Run Task > cds watch_)

## Changing Mock Data

If you want to deploy the Mock Server with other mock data you should change the corresponding CSV files in *srv/csv/* folder.

For example to create a new business partner add a new line to *OP_API_BUSINESS_PARTNER_SRV-A_BusinessPartner.csv* file. The content of the line should exactly correspond to the header line of the file. Here is an example how to add a new business partner with the ID, name and category filled only:

![New mock data line](img/new-mock-data-line.png)

To add additional field to the mock data do the following: 
- check the field name in the model file *srv/external/OP_API_BUSINESS_PARTNER_SRV.cds*:
  ![Field Name in Model](img/model-file-example.png)
- add the field name to the header and field value to the lines correspondingly:
  ![New field data](img/new-field.png)
- **[NOTE]:** you should adjust all the existing lines with the new field(s)!
