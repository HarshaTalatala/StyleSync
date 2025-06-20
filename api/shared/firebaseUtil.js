const admin = require('firebase-admin');

let initializationError = null;

if (admin.apps.length === 0) {
    try {
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            console.log("Firebase service account JSON available.");
            const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
            const serviceAccount = JSON.parse(serviceAccountString);
            if (serviceAccount.private_key) {
                console.log("Original private key length:", serviceAccount.private_key.length);
                
                // Fix the common issue with PEM formatting
                // This handles various ways the key might be stored in environment variables
                if (!serviceAccount.private_key.startsWith('-----BEGIN PRIVATE KEY-----')) {
                    serviceAccount.private_key = `-----BEGIN PRIVATE KEY-----\n${serviceAccount.private_key}\n-----END PRIVATE KEY-----\n`;
                    console.log("Added PEM headers to private key");
                }
                
                // Replace all escaped newlines with actual newlines
                serviceAccount.private_key = serviceAccount.private_key
                    .replace(/\\n/g, '\n')
                    .replace(/\r\n/g, '\n')
                    .replace(/\n\n/g, '\n');
                
                console.log("After fixing, private key starts with:", 
                    serviceAccount.private_key.substring(0, 30));
                console.log("After fixing, private key ends with:", 
                    serviceAccount.private_key.substring(serviceAccount.private_key.length - 30));
            }
            
            console.log("Attempting to initialize Firebase Admin SDK with project:", serviceAccount.project_id);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
            console.log("Firebase Admin SDK successfully initialized.");
        } else {
            initializationError = new Error("FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.");
            console.error(initializationError);
        }
    } catch (e) {
        console.error('CRITICAL: Firebase Admin SDK initialization error.', e);
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
    context.log.error("Token verification failed:", error);
    context.res = {
      status: 403,
      body: `Forbidden: Authentication error - ${error.message}`
    };
    return null;
  }
};

module.exports = { authenticateToken };