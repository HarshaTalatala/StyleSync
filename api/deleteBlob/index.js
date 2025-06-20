const { BlobServiceClient } = require('@azure/storage-blob');
const { authenticateToken } = require('../shared/firebaseUtil');

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

    const decodedToken = await authenticateToken(context, req);
    if (!decodedToken) {
      context.res.headers = { ...context.res.headers, ...corsHeaders };
      return;
    }
    req.user = decodedToken;

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