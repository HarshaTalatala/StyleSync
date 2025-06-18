import { db } from './firebase';
import {
  collection, doc, deleteDoc, query, getDocs, serverTimestamp, setDoc
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { getAuth } from 'firebase/auth';

const getUserWardrobeCollectionRef = (uid) =>
  collection(db, `users/${uid}/wardrobe`);

// Backend API URL - using local development server
const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:3001/api';

export const uploadWardrobeItem = async (uid, itemData, imageFile) => {
  try {
    if (!imageFile) {
      toast.error("Please select an image file.");
      return false;
    }
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
        toast.error("User not authenticated.");
        return false;
    }
    const idToken = await user.getIdToken();
    const itemRef = doc(getUserWardrobeCollectionRef(uid));
    const itemId = itemRef.id;
    const blobName = `${itemId}.${imageFile.name.split('.').pop()}`;
    
    // Use local backend endpoint
    const sasResponse = await fetch(`${BACKEND_API_URL}/generate-sas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ blobName: `${uid}/wardrobeImages/${blobName}` }),
    });
    if (!sasResponse.ok) {
      throw new Error(`Failed to get SAS URL: ${sasResponse.statusText}`);
    }
    const { sasUrl, blobUrl } = await sasResponse.json();
    const uploadResponse = await fetch(sasUrl, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': imageFile.type,
      },
      body: imageFile,
    });
    if (!uploadResponse.ok) {
      throw new Error(`Failed to upload image to Azure: ${uploadResponse.statusText}`);
    }
    await setDoc(itemRef, {
      ...itemData,
      itemId: itemId,
      imageURL: blobUrl,
      uploadedAt: serverTimestamp(),
      userId: uid
    });
    return true;
  } catch (error) {
    console.error('Error uploading item:', error);
    toast.error(`Error uploading item: ${error.message}`);
    return false;
  }
};

export const getWardrobeItems = async (uid) => {
    try {
        const q = query(getUserWardrobeCollectionRef(uid));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return items;
    } catch (error) {
        console.error('Error fetching wardrobe items:', error);
        toast.error(`Error fetching wardrobe items: ${error.message}`);
        return [];
    }
};

export const deleteWardrobeItem = async (uid, itemId, imageURL) => {
  try {
    const itemRef = doc(getUserWardrobeCollectionRef(uid), itemId);
    
    // Delete image from Azure Storage if imageURL exists
    if (imageURL) {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        await fetch(`${BACKEND_API_URL}/delete-blob`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ imageURL }),
        });
      }
    }
    
    await deleteDoc(itemRef);
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    toast.error(`Error deleting item: ${error.message}`);
    return false;
  }
};