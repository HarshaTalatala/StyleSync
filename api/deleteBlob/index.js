const { BlobServiceClient } = require('@azure/storage-blob');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch(e) {
    console.error('Firebase Admin SDK initialization error:', e);
  }
}

const authenticateToken = async (context, req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    context.res = {
      status: 401,
      body: 'No token provided.'
    };
    return false;
  }
  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    return true;
  } catch (error) {
    context.log.error("Token verification failed:", error); // Detailed logging
    context.res = {
      status: 403,
      body: `Authentication error: ${error.message}` // More descriptive error
    };
    return false;
  }
};

module.exports = async function (context, req) {
  // Always set CORS headers
  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  context.res = { headers: corsHeaders };
  try {
    if (req.method === 'OPTIONS') {
      context.res.status = 204;
      context.res.body = '';
      return;
    }
    if (!(await authenticateToken(context, req))) {
      context.res.headers = corsHeaders;
      return;
    }
    const { blobName } = req.body;
    if (!blobName) {
      context.res = {
        status: 400,
        headers: corsHeaders,
        body: 'Blob name is required.'
      };
      return;
    }
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'stylesync-wardrobe-images';
    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);
    await blobClient.deleteIfExists();
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: { message: 'Blob deleted successfully.' }
    };
  } catch (error) {
    context.log.error('Error in deleteBlob:', error);
    context.res = {
      status: 500,
      headers: corsHeaders,
      body: `Error deleting blob: ${error.message}`
    };
  }
};