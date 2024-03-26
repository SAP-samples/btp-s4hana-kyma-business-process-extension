# Determine Placeholder Values

For the deployment, you need to provide the following parameters:

- **DOCKER_ACCOUNT**: A Docker repository to store images.
  Use the image artifactory recommended by your organization. Incase if you dont have an artifactory you can use [dockerhub](https://docs.docker.com/docker-hub/quickstart/) for a **non-productive** usage.

- **DOCKER_SECRET**: In case of a private repository it would be a secret. The [documentation](!https://kubernetes.io/docs/reference/kubectl/generated/kubectl_create/kubectl_create_secret_docker-registry/) shows an example for creation of a secret for a repository. If you dont have a secret or if its a public repository you can leave this field empty.

- **Git Username** and **Password**: To connect to a GitHub repository with authentication over HTTP(S), every time it needs to set a username and (personal access token). Refer [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) to create a personal access token.
You also need to provide a Base64 encoded GitHub Username and Password.
You can run the below command in terminal to do a base64 encoding

      `echo -n "<STRING>" | base64`

- **Git URL**: https://github.com/SAP-samples/btp-s4hana-kyma-business-process-extension. 
Please use the relevant url, if you have your own fork of the main repository

- **Git branch**: main

