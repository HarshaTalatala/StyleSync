import { db } from './firebase';
import {
  collection, doc, setDoc, getDoc, query, where, getDocs, orderBy, limit, addDoc, deleteDoc
} from 'firebase/firestore';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const getUserPlannerCollectionRef = (uid) =>
  collection(db, `users/${uid}/planner`);

const getUserFavoritesCollectionRef = (uid) =>
  collection(db, `users/${uid}/favorites`);

export const savePlannedOutfit = async (uid, date, outfitItems) => {
  try {
    const docRef = doc(getUserPlannerCollectionRef(uid), date);
    await setDoc(docRef, {
      topId: outfitItems.topId || null,
      bottomId: outfitItems.bottomId || null,
      shoeId: outfitItems.shoeId || null,
      accessoryId: outfitItems.accessoryId || null,
      plannedAt: dayjs().toDate(),
      date: date 
    });
    return true;
  } catch (error) {
    toast.error(`Error saving outfit: ${error.message}`);
    return false;
  }
};

export const getPlannedOutfit = async (uid, date) => {
  try {
    const docRef = doc(getUserPlannerCollectionRef(uid), date);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getAllPlannedOutfits = async (uid) => {
  try {
    const q = query(getUserPlannerCollectionRef(uid), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const outfits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return outfits;
  } catch (error) {
    toast.error(`Error fetching all planned outfits: ${error.message}`);
    return [];
  }
};

export const addFavoriteOutfit = async (uid, outfitData) => {
  try {
    await addDoc(getUserFavoritesCollectionRef(uid), {
      ...outfitData,
      favoritedAt: dayjs().toDate()
    });
    toast.success('Outfit added to favorites!');
    return true;
  } catch (error) {
    toast.error(`Error adding to favorites: ${error.message}`);
    return false;
  }
};

export const getFavoriteOutfits = async (uid) => {
  try {
    const q = query(getUserFavoritesCollectionRef(uid), orderBy('favoritedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const favorites = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return favorites;
  } catch (error) {
    toast.error(`Error fetching favorite outfits: ${error.message}`);
    return [];
  }
};

export const removeFavoriteOutfit = async (uid, outfit) => {
  try {
    const favsRef = collection(db, 'users', uid, 'favorites');
    const q = query(
      favsRef,
      where('date', '==', outfit.date),
      where('topId', '==', outfit.topId || null),
      where('bottomId', '==', outfit.bottomId || null),
      where('shoeId', '==', outfit.shoeId || null),
      where('accessoryId', '==', outfit.accessoryId || null)
    );
    const snapshot = await getDocs(q);
    for (const docSnap of snapshot.docs) {
      await deleteDoc(docSnap.ref);
    }
    toast.success('Outfit removed from favorites!');
    return true;
  } catch (error) {
    toast.error(`Error removing from favorites: ${error.message}`);
    return false;
  }
};

export const deletePlannedOutfit = async (uid, date) => {
  try {
    const docRef = doc(getUserPlannerCollectionRef(uid), date);
    await deleteDoc(docRef);
    toast.success('Outfit deleted!');
    return true;
  } catch (error) {
    toast.error(`Error deleting outfit: ${error.message}`);
    return false;
  }
};
