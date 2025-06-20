const admin = require('firebase-admin');

let initializationError = null;

if (admin.apps.length === 0) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
            const serviceAccount = JSON.parse(serviceAccountString);
            if (serviceAccount.private_key) {
                // Fix the common issue with PEM formatting
                // This handles various ways the key might be stored in environment variables
                if (!serviceAccount.private_key.startsWith('-----BEGIN PRIVATE KEY-----')) {
                    serviceAccount.private_key = `-----BEGIN PRIVATE KEY-----\n${serviceAccount.private_key}\n-----END PRIVATE KEY-----\n`;
                }
                // Replace all escaped newlines with actual newlines
                serviceAccount.private_key = serviceAccount.private_key
                    .replace(/\\n/g, '\n')
                    .replace(/\r\n/g, '\n')
                    .replace(/\n\n/g, '\n');
            }
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            initializationError = new Error("FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.");
        }
    } catch (e) {
        initializationError = e;
    }
}

const authenticateToken = async (context, req) => {
  if (initializationError) {
    context.res = {
      status: 500,
      body: `Internal Server Error: Firebase Admin SDK initialization failed: ${initializationError.message}`
    };
    return null;
  }
  if (admin.apps.length === 0) {
    context.res = {
      status: 500,
      body: 'Internal Server Error: Firebase Admin SDK not initialized. Check server logs for details.'
    };
    return null;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    context.res = {
      status: 401,
      body: 'Unauthorized: No token provided.'
    };
    return null;
  }

  const idToken = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    context.res = {
      status: 403,
      body: `Forbidden: Authentication error - ${error.message}`
    };
    return null;
  }
};

module.exports = { authenticateToken };