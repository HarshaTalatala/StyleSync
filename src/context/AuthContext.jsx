import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword as firebaseUpdatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile as firebaseUpdateProfile
} from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }
  async function logout() {
    await signOut(auth);
    setCurrentUser(null);
  }
  async function updatePassword(currentPassword, newPassword) {
    if (!auth.currentUser) {
      throw new Error('No user is currently logged in');
    }
    
    // Reauthenticate the user before changing password
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    
    await reauthenticateWithCredential(auth.currentUser, credential);
    return firebaseUpdatePassword(auth.currentUser, newPassword);
  }
  
  async function updateUserProfile(profileData) {
    if (!auth.currentUser) {
      throw new Error('No user is currently logged in');
    }
    
    // Update the user profile in Firebase Auth
    await firebaseUpdateProfile(auth.currentUser, profileData);
    
    // Force a refresh to get the updated user data
    await auth.currentUser.reload();
    
    // Update the currentUser state with the new data
    setCurrentUser({...auth.currentUser});
    
    return auth.currentUser;
  }
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      console.log("Auth state changed, new user:", user);
      setCurrentUser(user);
      setLoading(false);
    });
    
    // We'll also check periodically for user updates when the user is logged in
    // This helps ensure the UI stays in sync with Firebase Auth
    const refreshInterval = setInterval(() => {
      if (auth.currentUser) {
        auth.currentUser.reload()
          .then(() => {
            // Only update state if there are actually changes
            if (currentUser && 
                (currentUser.displayName !== auth.currentUser.displayName ||
                 currentUser.photoURL !== auth.currentUser.photoURL)) {
              console.log("Detected user profile changes, updating state");
              setCurrentUser({...auth.currentUser});
            }
          })
          .catch(err => console.error("Error refreshing user data:", err));
      }
    }, 10000); // Check every 10 seconds
    
    return () => {
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [currentUser]);
  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    updatePassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}