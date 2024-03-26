# Deploy the Application to SAP BTP Kyma Runtime

 **[NOTE]:** Instance of SAP BTP connectivity service (connectivity-proxy plan) is created to establish a secure tunnel between SAP BTP Kyma environment and a system in your On-Premise network. This provisioning must be done only once in your cluster. See section [Configure SAP BTP Connectivity in the Kyma Environment](https://help.sap.com/docs/BTP/65de2977205c403bbc107264b8eccf4b/0c035010a9d64cc8a02d872829c7fa75.html) on SAP Help Portal for more details.


1. Clone the source code by executing the below command

    ```shell
    git clone https://github.com/SAP-samples/btp-s4hana-kyma-business-process-extension.git
    ```
    
   Navigate to root folder of the cloned source code.

 2. If the connectivity service is not provisioned after creation of cluster by your administrator, you can do it by running the following command:

     
     ```shell
     kubectl apply -f ./script/connectivity.yaml -n <NAME_SPACE>
     ```

    **[NOTE]:** If admin has created the connectivity service instance in a different namespace, then get the secret and update the `connectivity-secret.yaml` file with the required encoded values. As a next step, Create the secret for connectivity service by running the following command.

     ```shell
     kubectl apply -f ./script/connectivity-secret.yaml -n <NAME_SPACE>
     ```

3. Open Makefile and edit the value for **DOCKER_ACCOUNT**.


4. Build the applications and also create and push the docker images to docker account by executing the following script:

    ```shell
    make push-images
    ```

5. Open the `chart/values.yaml` file:

    Edit the domain of your cluster, so that the URL of your CAP service can be generated. You can use the preconfigured domain name for your Kyma cluster:

    ```shell
    kubectl get configmap -n kube-system shoot-info -ojsonpath='{.data.domain}'
    ```

6. For a private container registry, create a secret for your Docker repository and replace the value of **DOCKER_SECRET** with the created secret name:

    ```shell
    imagePullSecret: name: <DOCKER_SECRET>
    ```

7. Find all values for **DOCKER_ACCOUNT** and replace all with your docker account/repository.

8. Navigate to **Kyma Console** --> **Your Namespace** --> **Configuration** --> **Secrets**. Copy the       connectivity service secret name.
Find all values for **CONNECTIVITY_SECRET** and replace all with your connectivity secret name.

9. Find all values for **RELEASE_NAME** and replace all with your Helm Chart's release name. This can be any name of your choice.

10. Replace the value for **namespace** with the Kyma namespace in which you are going to dpeloy your application.

10. Replace the value for **base64_encodeduser** with encoded Git username.

11. Replace the value for **base_64_encoded_GIT_secret** with encoded Git password.

12. Replace the value for **git_repo_url** with url of your git repository.

13. Replace the values for **git_branch** with the name of your git branch.

14. Run the following command to deploy your application:

    ```shell
    helm upgrade --install <RELEASE_NAME> ./chart -n <NAMESPACE> --set-file event-mesh.jsonParameters=chart/event-mesh.json --set-file xsuaa.jsonParameters=chart/xs-security.json
    ```
