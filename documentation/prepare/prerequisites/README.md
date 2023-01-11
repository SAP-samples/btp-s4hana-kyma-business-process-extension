# Prerequisites and Required Systems

This section contains the prerequisites that you have to fulfill before you get started. Make sure that the prerequisites are fulfilled and all required systems, services, and tools are available.

## Systems and Accounts

* [Global account](https://help.sap.com/docs/BTP/65de2977205c403bbc107264b8eccf4b/8ed4a705efa0431b910056c0acdbf377.html#loio8d6e3a0fa4ab43e4a421d3ed08128afa) in SAP BTP.
* [SAP S/4HANA](https://www.sap.com/india/products/s4hana-erp.html) system.
* [Optional] If you don't have access to SAP S/4HANA on-premise system
  * Option 1 - you could use the 30-day trial version. Refer [SAP S/4HANA Test System Using SAP Cloud Appliance Library](../cal/README.md) for more details.
  * Option 2 -  you can also run this mission by installing a [mock server](../../deploy/setup-mock/README.md).

## Tools

* [Node.js](https://nodejs.org/en/download/) - find the latest Node.js version supported by [CAP](https://cap.cloud.sap/docs/advanced/troubleshooting#node-version).
* [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [Visual Studio Code](https://code.visualstudio.com/download) or another suitable IDE or editor of your choice
* [kubectl command line tool (kubectl)]( https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/)
* [cds-dk](https://cap.cloud.sap/docs/get-started/)
* (For Windows) [SQLite ](https://sqlite.org/download.html) Find the steps how to install it in the CAP documentation in section [How Do I Install SQLite](https://cap.cloud.sap/docs/advanced/troubleshooting#how-do-i-install-sqlite-on-windows).
* [Docker](https://www.docker.com/products/docker-desktop)
* See [prerequisites section](https://cap.cloud.sap/docs/guides/deployment/deploy-to-kyma#prerequisites) for Deploying CAP Applications to Kyma runtime for other required tools.

### Entitlements

The application requires the following [Entitlements and Quotas](https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/00aa2c23479d42568b18882b1ca90d79.html?locale=en-US) in the SAP BTP cockpit:

| Service                           | Plan               | Number of Instances |
|-----------------------------------|------------------- |:-------------------:|
| SAP HANA Schemas & HDI Containers | hdi-shared         |          1          |
| SAP HANA Cloud                    | tools              |  Subscription       |
| SAP HANA Cloud                    | hana               |          1          |
| Event Mesh                        | default            |          1          |
| Kyma runtime                      |                    |          1          |
| Connectivity Service              | connectivity_proxy |          1          |
| Launchpad Service                 | standard           |  Subscription       |

## Instance of Connectivity Service

Instance of SAP BTP connectivity service (connectivity-proxy plan) is created to establish a secure tunnel between SAP BTP Kyma environment and a system in your On-Premise network. This provisioning must be done only once in your cluster.                                                   [Refer](https://help.sap.com/docs/BTP/65de2977205c403bbc107264b8eccf4b/0c035010a9d64cc8a02d872829c7fa75.html) for more details.
 If the connectivity service is not provisioned after creation of cluster by your administrator, you can do it by running the below command:

    kubectl apply -f ./script/connectivity.yaml
