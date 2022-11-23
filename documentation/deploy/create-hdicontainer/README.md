# Create HDI Container and Its Corresponding Secrets

1. Clone the extension application and navigate to the root folder of the app.

    `git clone <git_url>`

2. Set the namespace:

    `kubectl config set-context --current --namespace <NAME_SPACE>`

2. Run `./script/db.sh`:

>Note: Ensure you have logged in to Cloud Foundry CLI.
>
>The script does the following:
> - Creates HDI Service instance with the name `caphana`
> - Creates a service key corresponding to the hdi service instance
> - Creates a secret in Kyma for the created HDI instance
