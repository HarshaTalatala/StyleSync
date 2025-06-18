import { db } from './firebase';
import {
  collection, doc, query, where, getDocs, addDoc, deleteDoc, setDoc, getDoc
} from 'firebase/firestore';

// Helper function to get user-specific collection references
const getUserPlannerCollectionRef = (userId) => collection(db, `users/${userId}/planner`);
const getUserFavoritesCollectionRef = (userId) => collection(db, `users/${userId}/favorites`);

export const savePlannedOutfit = async (userId, date, outfitData) => {
  try {
    const outfitRef = getUserPlannerCollectionRef(userId);
    await addDoc(outfitRef, {
      date,
      ...outfitData,
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error saving planned outfit:', error);
    return false;
  }
};

export const getPlannedOutfit = async (userId, date) => {
  try {
    const outfitRef = getUserPlannerCollectionRef(userId);
    const q = query(outfitRef, where('date', '==', date));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error getting planned outfit:', error);
    return null;
  }
};

export const getAllPlannedOutfits = async (userId) => {
  try {
    const outfitRef = getUserPlannerCollectionRef(userId);
    const querySnapshot = await getDocs(outfitRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting all planned outfits:', error);
    return [];
  }
};

export const addFavoriteOutfit = async (userId, outfitData) => {
  try {
    const favoriteRef = getUserFavoritesCollectionRef(userId);
    await addDoc(favoriteRef, {
      ...outfitData,
      createdAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error adding favorite outfit:', error);
    return false;
  }
};

export const getFavoriteOutfits = async (userId) => {
  try {
    const favoriteRef = getUserFavoritesCollectionRef(userId);
    const querySnapshot = await getDocs(favoriteRef);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting favorite outfits:', error);
    return [];
  }
};

export const removeFavoriteOutfit = async (userId, outfitData) => {
  try {
    const favoriteRef = getUserFavoritesCollectionRef(userId);
    const q = query(
      favoriteRef, 
      where('date', '==', outfitData.date),
      where('topId', '==', outfitData.topId),
      where('bottomId', '==', outfitData.bottomId),
      where('shoeId', '==', outfitData.shoeId),
      where('accessoryId', '==', outfitData.accessoryId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      await deleteDoc(doc(db, `users/${userId}/favorites`, querySnapshot.docs[0].id));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error removing favorite outfit:', error);
    return false;
  }
};

export const deletePlannedOutfit = async (userId, outfitId) => {
  try {
    await deleteDoc(doc(db, `users/${userId}/planner`, outfitId));
    return true;
  } catch (error) {
    console.error('Error deleting planned outfit:', error);
    return false;
  }
};
