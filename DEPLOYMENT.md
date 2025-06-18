# StyleSync Deployment Guide

This guide will walk you through deploying StyleSync to GitHub Pages (frontend) and Azure Functions (backend).

## 🚀 Prerequisites

1. **GitHub Account** - For repository and GitHub Pages
2. **Azure Account** - For Azure Functions and Storage
3. **Firebase Project** - For authentication and database
4. **Azure CLI** - For Azure resource management

## 📋 Step-by-Step Deployment

### Step 1: Push Frontend Code to GitHub

1. **Create a new GitHub repository**
   ```bash
   # Initialize git and push to GitHub (frontend only)
   git add .
   git commit -m "Initial commit: StyleSync frontend"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/StyleSync.git
   git push -u origin main
   ```

   **Note**: The backend folder is excluded from the repository and will be deployed separately.

### Step 2: Set Up Firebase

1. **Create Firebase Project** (if not already done)
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Get your Firebase config

2. **Get Firebase Service Account Key**
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Save as `backend/firebase-service-account.json` (for local development)

### Step 3: Set Up Azure Resources

1. **Install Azure CLI**
   ```bash
   # Windows
   winget install Microsoft.AzureCLI
   
   # macOS
   brew install azure-cli
   
   # Linux
   curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
   ```

2. **Login to Azure**
   ```bash
   az login
   ```

3. **Create Resource Group**
   ```bash
   az group create --name stylesync-rg --location eastus
   ```

4. **Create Storage Account**
   ```bash
   az storage account create \
     --name stylesyncstorage \
     --resource-group stylesync-rg \
     --location eastus \
     --sku Standard_LRS \
     --kind StorageV2
   ```

5. **Create Storage Container**
   ```bash
   az storage container create \
     --name stylesync-wardrobe-images \
     --account-name stylesyncstorage
   ```

6. **Get Storage Connection String**
   ```bash
   az storage account show-connection-string \
     --name stylesyncstorage \
     --resource-group stylesync-rg
   ```

7. **Create Azure Function App**
   ```bash
   az functionapp create \
     --name stylesync-functions \
     --resource-group stylesync-rg \
     --consumption-plan-location eastus \
     --runtime node \
     --runtime-version 18 \
     --functions-version 4 \
     --storage-account stylesyncstorage
   ```

8. **Configure Function App Settings**
   ```bash
   az functionapp config appsettings set \
     --name stylesync-functions \
     --resource-group stylesync-rg \
     --settings \
     FIREBASE_PROJECT_ID="your-firebase-project-id" \
     AZURE_STORAGE_CONNECTION_STRING="your-storage-connection-string"
   ```

### Step 4: Deploy Backend to Azure Functions

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Azure Functions Core Tools**
   ```bash
   npm install -g azure-functions-core-tools
   ```

3. **Deploy to Azure Functions**
   ```bash
   func azure functionapp publish stylesync-functions
   ```

   **Alternative: Deploy via Azure CLI**
   ```bash
   az functionapp deployment source config-zip \
     --resource-group stylesync-rg \
     --name stylesync-functions \
     --src backend.zip
   ```

### Step 5: Configure GitHub Secrets

1. **Go to your GitHub repository**
2. **Navigate to Settings > Secrets and variables > Actions**
3. **Add the following secrets:**

   **Firebase Configuration:**
   ```
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

   **Azure Configuration:**
   ```
   VITE_BACKEND_API_URL=https://stylesync-functions.azurewebsites.net/api
   ```

### Step 6: Enable GitHub Pages

1. **Go to your GitHub repository**
2. **Navigate to Settings > Pages**
3. **Source: Deploy from a branch**
4. **Branch: gh-pages (will be created by GitHub Actions)**
5. **Save**

### Step 7: Deploy Frontend

1. **Push your changes to trigger deployment:**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push
   ```

2. **Monitor the deployment:**
   - Go to Actions tab in your GitHub repository
   - Watch the deployment progress

## 🔧 Post-Deployment Configuration

### Update Environment Variables

After deployment, update your local `.env` file with the production URLs:

```env
VITE_BACKEND_API_URL=https://stylesync-functions.azurewebsites.net/api
```

### Test the Deployment

1. **Frontend**: Visit `https://YOUR_USERNAME.github.io/StyleSync`
2. **Backend**: Test Azure Functions endpoints at `https://stylesync-functions.azurewebsites.net/api`
3. **Database**: Verify Firebase connections

## 🛠️ Troubleshooting

### Common Issues:

1. **Azure Functions not deploying**
   - Check Azure CLI is logged in
   - Verify function app name matches
   - Ensure backend folder is properly configured

2. **GitHub Pages not working**
   - Ensure repository is public
   - Check Actions permissions
   - Verify build is successful

3. **Firebase connection issues**
   - Verify Firebase project ID is correct
   - Check Firestore rules allow access
   - Ensure environment variables are set

### Debug Commands:

```bash
# Test Azure Functions locally
cd backend
func start

# Check Azure resources
az resource list --resource-group stylesync-rg

# View function logs
az functionapp logs tail --name stylesync-functions --resource-group stylesync-rg

# Redeploy backend
cd backend
func azure functionapp publish stylesync-functions
```

## 📞 Support

If you encounter issues:
1. Check the GitHub Actions logs for frontend deployment
2. Verify Azure Functions deployment was successful
3. Ensure all secrets are correctly set
4. Test locally before deploying

## 🔄 Continuous Deployment

- **Frontend**: Every push to the `main` branch automatically deploys to GitHub Pages
- **Backend**: Deploy manually when backend changes are made using `func azure functionapp publish`

## 🏗️ Project Structure

```
StyleSync/ (GitHub Repository - Frontend Only)
├── src/                    # Frontend source code
├── .github/workflows/      # GitHub Actions
├── package.json           # Frontend dependencies
└── README.md              # Project documentation

backend/ (Local Development - Deployed to Azure)
├── functions/             # Azure Functions
├── firebase-service-account.json
├── host.json
└── package.json          # Backend dependencies
```

Your StyleSync application is now properly separated with frontend on GitHub Pages and backend on Azure Functions! 