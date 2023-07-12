# Set Up Mock Server
Mock Server can be used in case there is no SAP S/4HANA system available for testing this mission. Mock Server is a [CAP](https://cap.cloud.sap/docs/get-started/) based application that serves API and Events required for this mission.

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

2. Navigate to the **chart** folder and edit the **values.yaml** file in the cloned source code.

3. Edit the domain of your cluster, so that the URL of your CAP service can be generated. You can use the preconfigured domain name for your Kyma cluster:

    ```
    kubectl get configmap -n kube-system shoot-info -ojsonpath='{.data.domain}'
    ```
4. Find all values for **DOCKER_ACCOUNT** and replace all with your docker account/repository.

5. For a private container registry: Create a secret for your Docker repository and replace the value of **DOCKER_SECRET** with the created secret name.

    ```
    imagePullSecret: name: <DOCKER_SECRET>
    ```

**Note:** Make sure that you deploy the mock server to the same namespace where the Kyma application has been deployed.

6. Find all values for **RELEASE_NAME_OF_KYMAAPP** and replace all with the release name of CAP application deployed in [previous steps](../deploy/README.md).

7. Run the following command to deploy your application:

    ```
    helm upgrade --install <RELEASE_NAME> ./chart -n <NAMESPACE>
    ```
    
**Note:** Make sure that the release names are different for the mock server and CAP application.

### Set Up Destination in SAP BTP

1. Open your SAP BTP account and navigate to your **Subaccount**.

2. Choose **Connectivity** in the menu on the left then choose **Destinations** &rarr; **New Destination**.

3. After the successful deployment of mock application you will get the following message in the terminal:
    ```
        Application "mock-srv" started and available at "https://<mock_srv_url>"
    ```
    
   Copy the above URL and use it in the next step.

3. Enter the following information to the Destination Configuration and **Save** your input:

    - Name: `s4h`
    - Type: `HTTP`
    - URL: `https://<mock_srv_url>`
    - Authentication: `No Authentication`
    - proxy type: `Internet`
    - Select `Use default JDK truststore`
