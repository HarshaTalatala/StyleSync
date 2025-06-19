import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

console.log('ENV:', import.meta.env);

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAT2M-8X4DsB4E3n0hesfAmEGbkUimFI2E",
  authDomain: "stylesync-dev.firebaseapp.com",
  projectId: "stylesync-dev",
  storageBucket: "stylesync-dev.firebasestorage.app",
  messagingSenderId: "184024756810",
  appId: "1:184024756810:web:bc7d93376ebd9d3e812cb3",
  measurementId: "G-3ZG7RHS014"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage, analytics };
