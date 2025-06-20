const assert = require('assert');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

describe('Firebase Admin SDK Initialization', function() {
  it('should initialize successfully using the service account from local.settings.json', function() {
    const localSettingsPath = path.resolve(__dirname, '../local.settings.json');
    
    assert(fs.existsSync(localSettingsPath), 'local.settings.json not found!');

    const localSettings = JSON.parse(fs.readFileSync(localSettingsPath, 'utf8'));
    const serviceAccountString = localSettings.Values.FIREBASE_SERVICE_ACCOUNT_JSON;

    assert(serviceAccountString, 'FIREBASE_SERVICE_ACCOUNT_JSON is not defined in local.settings.json');

    const serviceAccount = JSON.parse(serviceAccountString);

    // If the app is already initialized by another test or file, this will throw.
    // We want a clean test. We can get around this by giving the app a name.
    const appName = `test-app-${Date.now()}`;
    try {
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      }, appName);

      assert.ok(app, 'Firebase app should be initialized');
      
      // Clean up the initialized app
      return app.delete().then(() => {
        console.log('Test Firebase app deleted successfully.');
      });

    } catch (error) {
      console.error('Firebase initialization failed!', error);
      assert.fail(`Firebase initialization failed: ${error.message}`);
    }
  });
}); 