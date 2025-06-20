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
  }  async function updateUserProfile(profileData) {
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
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
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