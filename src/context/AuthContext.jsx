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
    try {
      await signOut(auth);
      setCurrentUser(null);
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      // Even if Firebase logout fails, clear the local state
      setCurrentUser(null);
      throw error;
    }
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
      if (!document.hidden) {
        // Page became visible, check and refresh auth state
        console.log('Page became visible, checking auth state...');
        
        // Force a check of the current auth state
        const currentUser = auth.currentUser;
        if (currentUser) {
          // User is still logged in, refresh their data
          currentUser.reload().then(() => {
            const freshUser = {...currentUser};
            setCurrentUser(freshUser);
            console.log('User refreshed on visibility change:', freshUser.email);
          }).catch((error) => {
            console.error('Error refreshing user on visibility change:', error);
            // If refresh fails, the user might have been logged out
            if (error.code === 'auth/user-token-expired' || 
                error.code === 'auth/user-not-found' || 
                error.code === 'auth/network-request-failed') {
              setCurrentUser(null);
              console.log('User logged out due to token expiration or network error');
            }
          });
        } else {
          // No current user, ensure state is cleared
          setCurrentUser(null);
          console.log('No user found on visibility change');
        }
      }
    };

    // Handle storage events (for multi-tab synchronization)
    const handleStorageChange = (e) => {
      if (e.key === 'firebase:authUser:' + auth.config.apiKey + ':[DEFAULT]') {
        console.log('Auth storage changed, refreshing state...');
        // Force a re-check of auth state
        const currentUser = auth.currentUser;
        if (currentUser) {
          setCurrentUser({...currentUser});
        } else {
          setCurrentUser(null);
        }
      }
    };

    // Handle beforeunload to ensure clean state
    const handleBeforeUnload = () => {
      console.log('Page unloading, preserving auth state...');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Also listen for focus events as a backup
    const handleWindowFocus = () => {
      if (auth.currentUser) {
        console.log('Window focused, checking auth state...');
        auth.currentUser.reload().catch((error) => {
          console.error('Error refreshing user on window focus:', error);
          if (error.code === 'auth/user-token-expired' || error.code === 'auth/user-not-found') {
            setCurrentUser(null);
          }
        });
      }
    };

    window.addEventListener('focus', handleWindowFocus);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('focus', handleWindowFocus);
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
    refreshUser,
    forceRefreshAuth: () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        currentUser.reload().then(() => {
          setCurrentUser({...currentUser});
        }).catch((error) => {
          console.error('Force refresh auth error:', error);
          if (error.code === 'auth/user-token-expired' || error.code === 'auth/user-not-found') {
            setCurrentUser(null);
          }
        });
      } else {
        setCurrentUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}