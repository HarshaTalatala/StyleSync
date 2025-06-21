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
    await firebaseUpdateProfile(auth.currentUser, profileData);
    await auth.currentUser.reload();
    const updatedUser = {...auth.currentUser};
    setCurrentUser(updatedUser);
    return updatedUser;
  }
  
  async function refreshUser() {
    if (!auth.currentUser) {
      throw new Error('No user is currently logged in');
    }
    try {
      await auth.currentUser.reload();
      const freshUser = {...auth.currentUser};
      setCurrentUser(freshUser);
      return freshUser;
    } catch (error) {
      throw error;
    }
  }
  
  useEffect(() => {
    // Check if there's already a user when the component mounts
    const currentAuthUser = auth.currentUser;
    if (currentAuthUser) {
      console.log('Found existing user on mount:', currentAuthUser.email);
      setCurrentUser({...currentAuthUser});
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      
      if (user) {
        // Always update the current user when auth state changes
        const freshUser = {...user};
        setCurrentUser(freshUser);
        console.log('User authenticated:', freshUser.email);
      } else {
        setCurrentUser(null);
        console.log('User signed out');
      }
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setCurrentUser(null);
      setLoading(false);
    });

    // Handle page visibility changes to refresh auth state
    const handleVisibilityChange = () => {
      if (!document.hidden && auth.currentUser) {
        // Page became visible, refresh the user data
        auth.currentUser.reload().then(() => {
          const freshUser = {...auth.currentUser};
          setCurrentUser(freshUser);
        }).catch((error) => {
          console.error('Error refreshing user on visibility change:', error);
          // If refresh fails, the user might have been logged out
          if (error.code === 'auth/user-token-expired' || error.code === 'auth/user-not-found') {
            setCurrentUser(null);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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