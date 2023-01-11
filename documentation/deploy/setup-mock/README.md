# Set Up Mock Server

## Clone the Mock Server

Clone the mock server application from [GitHub](https://github.com/SAP-samples/btp-s4hana-kyma-business-process-extension) using the branch `mockserver`:

```
git clone <Git URL> -b mockserver
```

## Deploy the mock server to SAP BTP Kyma runtime

To deploy the application, perform the following steps:

1. Navigate to the root folder in the cloned source code and run the following commands to build and push the docker image:

    ```shell
    cds build --production
    pack build kymamock --path gen/srv --builder paketobuildpacks/builder:base
    docker tag kymamock:latest <DOCKER_ACCOUNT>/kymamock:latest
    docker push <DOCKER_ACCOUNT>/kymamock:latest
    ```

2. Navigate to the **charts** folder in the cloned source code.

3. Edit the domain of your cluster, so that the URL of your CAP service can be generated. You can use the preconfigured domain name for your Kyma cluster:

    ```
    kubectl get configmap -n kube-system shoot-info -ojsonpath='{.data.domain}'
    ```
4. Find all values for <DOCKER_ACCOUNT> and replace all with your docker account/repository.

5. For a private container registry: Create a secret for your Docker repository and replace the value of <DOCKER_SECRET> with the created secret name.
   
    imagePullSecret: name: <DOCKER_SECRET>

**Note:** Make sure that you deploy the mock server to the same namespace where the Kyma application has been deployed.

6. Find all values for <RELEASE_NAME_OF_KYMAAPP> and replace all with the release name of CAP application deployed in previous steps.

7. Run the following command to deploy your application:

    ```
    helm upgrade --install <RELEASE_NAME> ./chart -n <NAMESPACE>
    ```
    
**Note:** Make sure that the release names are different for the mock server and CAP application.

### Set Up Destination in SAP BTP

1. Open your SAP BTP account and navigate to your **Subaccount**.

2. Choose **Connectivity** in the menu on the left then choose **Destinations** &rarr; **New Destination**.

3. Enter the following information to the Destination Configuration and **Save** your input:

    - Name: `s4h`
    - Type: `HTTP`
    - URL: `https://<mock_srv_url>`
    - Authentication: `No Authentication`
    - proxy type: `Internet`
    - Select `Use default JDK truststore`

### Demo Script

1. Start your Business Partner Validation Application:

- Go to **Instances and Subscriptions**.
- Find **Launchpad Service** and click to open the application.
- In the Website Manager find your created Website and click on tile to open it.
- Click on **Business Partner Validation** tile.
- The list of Business Partners along with their verification status gets displayed.

 ![App](./images/mock01.png)

2. Create a new Business Partner in the mock server using business partner API:

```
POST https://<mock_srv_url>/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner

{
    "BusinessPartner": "25599",
    "BusinessPartnerFullName": "Max Mustermann",
    "FirstName": "Max",
    "LastName": "Mustermann",
    "BusinessPartnerIsBlocked": true,
    "Language": "EN",
    "to_BusinessPartnerAddress": [
        {
            "BusinessPartner": "25599",
            "AddressID": "99",
            "StreetName": "Platz der Republik",
            "HouseNumber": "1",
            "PostalCode": "10557",
            "CityName": "Berlin",
            "Country": "DE",
            "Language": "EN"
        }
    ]
}
```

3. Now, go back to the BusinessPartnerValidation application to see if the new Business Partner has appeared as a new entry in the UI.

 ![App](./images/mock01.png)

4. Go to the details page for the new Business Partner.

5. Choose **Edit** and set the Status to **Verified**.

 ![Backend](./images/mock02.png)

6. (Optional) You can configure SAP Event Mesh in a way so that you can see the created event. For that you could create an additional queue that subscribes to the topic as well.

 ![Backend](./images/mock03.png)

7. Notice that the changes reflected back to the Business Partner in the mock server.

```
GET https:/<MOCK_SRV_URL>/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner('25599')

```

8. Play around with the app.
