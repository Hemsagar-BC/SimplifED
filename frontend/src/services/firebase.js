// Firebase client SDK initialization for frontend
// Uses web API key for browser-based operations
// Provides authentication, Firestore real-time listeners, and Storage upload
// All credentials come from .env file with REACT_APP_ prefix
// This is safe to use in browser - Firebase security rules protect your data

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, orderBy, onSnapshot, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// Firebase configuration from environment variables
// Get these values from Firebase Console → Project Settings → Your apps → Web app
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate that all required config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error('❌ Missing Firebase configuration:', missingKeys);
  throw new Error(`Missing Firebase config: ${missingKeys.join(', ')}`);
}

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Google OAuth provider for sign in with Google
const googleProvider = new GoogleAuthProvider();

console.log('✅ Firebase initialized successfully');
console.log(`📦 Project: ${firebaseConfig.projectId}`);

// ======================
// AUTHENTICATION HELPERS
// ======================

/**
 * Sign in with Google OAuth
 * @returns {Promise<UserCredential>} User credential with user info
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log('✅ Signed in with Google:', result.user.email);
    return result;
  } catch (error) {
    console.error('❌ Google sign-in error:', error.message);
    throw error;
  }
};

/**
 * Sign in with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<UserCredential>}
 */
export const signInWithEmail = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ Signed in:', result.user.email);
    return result;
  } catch (error) {
    console.error('❌ Sign-in error:', error.message);
    throw error;
  }
};

/**
 * Create new user with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<UserCredential>}
 */
export const signUpWithEmail = async (email, password) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    console.log('✅ Account created:', result.user.email);
    return result;
  } catch (error) {
    console.error('❌ Sign-up error:', error.message);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('✅ Signed out successfully');
  } catch (error) {
    console.error('❌ Sign-out error:', error.message);
    throw error;
  }
};

/**
 * Listen to authentication state changes
 * @param {Function} callback - Called with user object when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// ======================
// FIRESTORE HELPERS
// ======================

/**
 * Create or update a document in Firestore
 * @param {string} collectionName - Collection name (e.g., 'lectures')
 * @param {string} docId - Document ID
 * @param {object} data - Data to save
 */
export const saveDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, { ...data, updatedAt: new Date() }, { merge: true });
    console.log(`✅ Document saved: ${collectionName}/${docId}`);
    return docRef;
  } catch (error) {
    console.error('❌ Error saving document:', error.message);
    throw error;
  }
};

/**
 * Get a single document from Firestore
 * @param {string} collectionName 
 * @param {string} docId 
 * @returns {Promise<object|null>} Document data or null if not found
 */
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log(`Document not found: ${collectionName}/${docId}`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting document:', error.message);
    throw error;
  }
};

/**
 * Listen to real-time updates on a document
 * @param {string} collectionName 
 * @param {string} docId 
 * @param {Function} callback - Called with document data on updates
 * @returns {Function} Unsubscribe function
 */
export const listenToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  });
};

/**
 * Listen to real-time updates on a collection
 * @param {string} collectionName 
 * @param {Function} callback - Called with array of documents
 * @param {object} queryConstraints - Optional query constraints
 * @returns {Function} Unsubscribe function
 */
export const listenToCollection = (collectionName, callback, queryConstraints = null) => {
  let collectionRef = collection(db, collectionName);
  
  if (queryConstraints) {
    collectionRef = query(collectionRef, ...queryConstraints);
  }
  
  return onSnapshot(collectionRef, (snapshot) => {
    const documents = [];
    snapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    callback(documents);
  });
};

/**
 * Get all documents from a collection
 * @param {string} collectionName 
 * @returns {Promise<Array>} Array of documents
 */
export const getCollection = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    const documents = [];
    
    snapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Got ${documents.length} documents from ${collectionName}`);
    return documents;
  } catch (error) {
    console.error('❌ Error getting collection:', error.message);
    throw error;
  }
};

/**
 * Delete a document from Firestore
 * @param {string} collectionName 
 * @param {string} docId 
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    console.log(`✅ Document deleted: ${collectionName}/${docId}`);
  } catch (error) {
    console.error('❌ Error deleting document:', error.message);
    throw error;
  }
};

// ======================
// STORAGE HELPERS
// ======================

/**
 * Upload file to Firebase Storage
 * @param {File|Blob} file - File to upload
 * @param {string} path - Storage path (e.g., 'lectures/abc123/audio.wav')
 * @param {Function} onProgress - Progress callback (percent)
 * @returns {Promise<string>} Download URL
 */
export const uploadFile = async (file, path, onProgress = null) => {
  try {
    const storageRef = ref(storage, path);
    
    if (onProgress) {
      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error('❌ Upload error:', error.message);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log(`✅ File uploaded: ${path}`);
            resolve(downloadURL);
          }
        );
      });
    } else {
      // Simple upload without progress
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      console.log(`✅ File uploaded: ${path}`);
      return downloadURL;
    }
  } catch (error) {
    console.error('❌ Error uploading file:', error.message);
    throw error;
  }
};

/**
 * Delete file from Firebase Storage
 * @param {string} path - Storage path
 */
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log(`✅ File deleted: ${path}`);
  } catch (error) {
    console.error('❌ Error deleting file:', error.message);
    throw error;
  }
};

/**
 * Get download URL for a file
 * @param {string} path - Storage path
 * @returns {Promise<string>} Download URL
 */
export const getFileURL = async (path) => {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('❌ Error getting file URL:', error.message);
    throw error;
  }
};

// Export Firebase instances for direct use if needed
export { auth, db, storage, app, googleProvider };

// Default export with all helpers
export default {
  auth,
  db,
  storage,
  googleProvider,
  // Auth methods
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  onAuthChange,
  // Firestore methods
  saveDocument,
  getDocument,
  listenToDocument,
  listenToCollection,
  getCollection,
  deleteDocument,
  // Storage methods
  uploadFile,
  deleteFile,
  getFileURL,
};