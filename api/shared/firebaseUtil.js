const admin = require('firebase-admin');

let firebaseInitialized = false;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    firebaseInitialized = true;
    console.log("Firebase Admin SDK successfully initialized.");
  } else {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set.");
  }
} catch (e) {
  console.error('CRITICAL: Firebase Admin SDK initialization error. The API will not work correctly. Please check your FIREBASE_SERVICE_ACCOUNT_JSON environment variable.', e);
  firebaseInitialized = false;
}

const authenticateToken = async (context, req) => {
  if (!firebaseInitialized) {
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

module.exports = { authenticateToken, firebaseInitialized }; 