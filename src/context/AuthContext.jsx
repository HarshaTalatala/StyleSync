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
  }  async function updateUserProfile(profileData) {
    if (!auth.currentUser) {
      throw new Error('No user is currently logged in');
    }
    
    console.log("Updating profile to:", profileData);
    
    // Update the user profile in Firebase Auth
    await firebaseUpdateProfile(auth.currentUser, profileData);
    
    // Force a refresh to get the updated user data
    await auth.currentUser.reload();
    
    // Create a new object with current properties and the updated properties
    const updatedUser = {...auth.currentUser};
    console.log("Firebase user after update:", updatedUser);
    
    // Update the currentUser state with the new data
    setCurrentUser(updatedUser);
    
    return updatedUser;
  }
  async function refreshUser() {
    if (!auth.currentUser) {
      throw new Error('No user is currently logged in');
    }
    
    try {
      // Force a refresh of user data from Firebase
      await auth.currentUser.reload();
      
      // Update our local state with fresh data
      const freshUser = {...auth.currentUser};
      console.log("Refreshed user data:", freshUser);
      setCurrentUser(freshUser);
      
      return freshUser;
    } catch (error) {
      console.error("Failed to refresh user data:", error);
      throw error;
    }
  }
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      console.log("Auth state changed, new user:", user);
      if (user) {
        // Create a fresh object to ensure React detects the change, but don't update if not needed
        if (!currentUser || 
            user.uid !== currentUser.uid ||  
            user.email !== currentUser.email) {
          const freshUser = {...user};
          setCurrentUser(freshUser);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
  }, []);
  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    updatePassword,
    updateUserProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}