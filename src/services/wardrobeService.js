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
    
    // Debug: Log token information
    console.log("User authenticated:", !!user);
    console.log("User UID:", user.uid);
    console.log("Token length:", idToken ? idToken.length : 0);
    console.log("Token starts with:", idToken ? idToken.substring(0, 20) + "..." : "No token");
    
    // Decode token header to check for 'kid' claim
    if (idToken) {
      try {
        const tokenParts = idToken.split('.');
        if (tokenParts.length === 3) {
          const header = JSON.parse(atob(tokenParts[0]));
          console.log("Token header:", header);
          console.log("Has 'kid' claim:", !!header.kid);
        }
      } catch (e) {
        console.log("Could not decode token header:", e);
      }
    }

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
    
    // First, delete the document from Firestore to ensure this part works
    await deleteDoc(itemRef);
    
    // Only attempt to delete the blob if there's an image path
    if (imagePath) {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) {
          console.warn("User not authenticated for blob deletion, but document was deleted.");
          return true; // Still return true since the document was deleted
        }
        
        // Get a fresh token to avoid any expiration issues
        const idToken = await user.getIdToken(false);
        
        const deleteBlobResponse = await fetch(`${BACKEND_API_URL}/deleteBlob`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`
          },
          body: JSON.stringify({ blobName: imagePath }),
        });

        if (!deleteBlobResponse.ok) {
          const errorBody = await deleteBlobResponse.text();
          console.warn(`Image deletion warning: ${deleteBlobResponse.statusText} - ${errorBody}`);
          // Don't throw error here, just log it as a warning
        }
      } catch (blobError) {
        // Log but don't fail the operation, as we've already deleted the document
        console.warn("Failed to delete image blob, but document was removed:", blobError);
      }
    }    
    // Document already deleted in the modified code above
    return true;
  } catch (error) {
    console.error('Error deleting item:', error);
    toast.error(`Error deleting item: ${error.message}`);
    return false;
  }
};

const getSasUrl = async (blobName) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated.');
  }
  const token = await user.getIdToken(true);

  // For debugging: decode and log token header
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length === 3) {
      const header = JSON.parse(atob(tokenParts[0]));
      console.log("Token header:", header);
      console.log("Has 'kid' claim:", !!header.kid);
    }
  } catch (e) {
    console.log("Could not decode token header:", e);
  }

  const response = await fetch(`${BACKEND_API_URL}/generateSas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ blobName }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Failed to get SAS URL: ${response.statusText} - ${errorBody}`);
  }

  return response.json();
};