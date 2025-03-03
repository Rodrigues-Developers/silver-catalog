# Prerequisites

Node.js v20+ (Use nvm use 20 if needed)

Azure CLI installed (az command available)

SWA CLI installed (npm install -g @azure/static-web-apps-cli)

# 1. Install Azure CLI (if not installed)

    npm install -g azure-cli

    az login

This will open a browser window to log in to your Azure account.

# 2. Log in to Azure with SWA CLI

    swa login

This ensures your CLI is authenticated with your Azure account.

# 3. Build Your Angular App

Before deploying, build the app to generate the dist folder:

    npm run build

Make sure your angular.json has the correct outputPath, usually:

"outputPath": "dist/silver-catalog"

# 4. Deploy to Azure Static Web Apps

    swa deploy ./dist/silver-catalog \
    --api-location "" \
    --env production \
    --deployment-token <PASTE_YOUR_DEPLOYMENT_TOKEN_HERE>

Replace <PASTE_YOUR_DEPLOYMENT_TOKEN_HERE> with the deployment token from Azure Portal > Static Web Apps > Deployment Token.

# 5. Verify the Deployment

Once deployed, Azure will give you a URL where the app is live.Example:

✔ Deployment complete! View it at: https://your-app-name.azurestaticapps.net

Open this link to check if everything is working.

🔄 Optional: Force a Fresh Deployment (If Needed)

If Azure caches an old version, use:

swa deploy ./dist/silver-catalog --no-use-cdn --deployment-token <TOKEN>
