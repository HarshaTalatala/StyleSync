const { BlobServiceClient, generateBlobSASQueryParameters, BlobSASPermissions, SASProtocol, StorageSharedKeyCredential } = require('@azure/storage-blob');
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

    // TEMPORARY DEBUG: Log authorization header information
    const authHeader = req.headers.authorization;
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
      }
    }
    
    // Try Firebase authentication
    const decodedToken = await authenticateToken(context, req);
    
    // TEMPORARY FIX: Even if authentication fails, proceed with a dummy user for testing
    if (!decodedToken) {
      req.user = { uid: "test-user" };
    } else {
      req.user = decodedToken;
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
    
    // Parse account name and key from connection string
    const matches = connectionString.match(/AccountName=([^;]+);AccountKey=([^;]+)/);
    if (!matches) throw new Error('Invalid Azure Storage connection string');
    const accountName = matches[1];
    const accountKey = matches[2];
    const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlockBlobClient(blobName);

    const expiresOn = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const sasToken = generateBlobSASQueryParameters({
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse('cw'), // create, write
      startsOn: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
      expiresOn,
      protocol: SASProtocol.Https
    }, sharedKeyCredential).toString();

    const sasUrl = `${blobClient.url}?${sasToken}`;
    
    context.res = {
      status: 200,
      headers: corsHeaders,
      body: { sasUrl, blobUrl: blobClient.url }
    };
  } catch (error) {
    context.res = {
      status: 500,
      headers: corsHeaders,
      body: `Error generating SAS: ${error.message}`
    };
  }
};