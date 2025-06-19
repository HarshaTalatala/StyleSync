import { db } from './firebase';
import {
  collection, doc, deleteDoc, query, getDocs, serverTimestamp, setDoc
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { getAuth } from 'firebase/auth';

const getUserWardrobeCollectionRef = (uid) =>
  collection(db, `users/${uid}/wardrobe`);

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || '/api';

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
    
    // *** THE CRUCIAL FIX IS HERE: Force a token refresh by passing `true` ***
    const idToken = await user.getIdToken(true);

    const itemRef = doc(getUserWardrobeCollectionRef(uid));
    const itemId = itemRef.id;
    const blobExtension = imageFile.name.split('.').pop();
    const blobName = `${itemId}.${blobExtension}`;
    const fullBlobPath = `${uid}/wardrobeImages/${blobName}`;
    
    const sasResponse = await fetch(`${BACKEND_API_URL}/generateSas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({ blobName: fullBlobPath }),
    });

    if (!sasResponse.ok) {
      const errorBody = await sasResponse.text();
      throw new Error(`Failed to get SAS URL: ${sasResponse.statusText} - ${errorBody}`);
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

    const { image, ...restItemData } = itemData;
    await setDoc(itemRef, {
      ...restItemData,
      id: itemId,
      imageURL: blobUrl,
      imagePath: fullBlobPath,
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

export const deleteWardrobeItem = async (uid, itemId, imagePath) => {
  try {
    const itemRef = doc(getUserWardrobeCollectionRef(uid), itemId);
    
    if (imagePath) {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        // *** THE CRUCIAL FIX IS HERE: Force a token refresh by passing `true` ***
        const idToken = await user.getIdToken(true);

        await fetch(`${BACKEND_API_URL}/deleteBlob`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ blobName: imagePath }),
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