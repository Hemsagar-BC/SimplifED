// Firebase Admin SDK initialization service for backend
// Uses service account credentials for server-side operations
// Provides access to Firestore database and Storage bucket
// Admin SDK has full read/write permissions - only use server-side!
// Environment variables required for full Firebase setup:
// FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

const admin = require('firebase-admin');

// Track whether Firebase is actually configured
const hasFirebaseConfig = !!(
  process.env.FIREBASE_PROJECT_ID &&
  process.env.FIREBASE_CLIENT_EMAIL &&
  process.env.FIREBASE_PRIVATE_KEY
);

let db = null;
let storage = null;
let auth = null;

if (!hasFirebaseConfig) {
  console.warn('⚠️ Firebase Admin SDK credentials not found. Firestore and Storage features are disabled.');
} else {
  // Parse private key - replace escaped newlines with actual newlines
  // The private key in .env has \\n which needs to be converted to actual line breaks
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

  try {
    // Initialize Firebase Admin with service account credentials
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
      // Storage bucket URL format: project-id.appspot.com
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });

    console.log('✅ Firebase Admin initialized successfully');
    console.log(`📦 Project: ${process.env.FIREBASE_PROJECT_ID}`);
    console.log(`🪣 Storage Bucket: ${process.env.FIREBASE_PROJECT_ID}.appspot.com`);

    // Get Firestore database instance
    // Used for reading/writing lecture data, segments, user info
    db = admin.firestore();

    // Configure Firestore settings for better performance
    db.settings({
      ignoreUndefinedProperties: true, // Ignore undefined values instead of throwing errors
    });

    // Get Firebase Storage bucket instance
    // Used for storing audio files uploaded by users
    storage = admin.storage().bucket();

    // Get Firebase Auth instance (for verifying user tokens if needed)
    auth = admin.auth();

  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin:', error.message);
  }
}

// Helper function to verify Firebase ID tokens from frontend
async function verifyIdToken(token) {
  try {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }
    const decodedToken = await auth.verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    throw new Error('Invalid authentication token');
  }
}

// Helper function to get user by UID
async function getUserById(uid) {
  try {
    if (!auth) {
      throw new Error('Firebase Auth is not configured');
    }
    const userRecord = await auth.getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('❌ Failed to get user:', error.message);
    throw error;
  }
}

// Export everything
module.exports = {
  admin,           // Full admin SDK (for advanced operations)
  db,              // Firestore database
  storage,         // Cloud Storage bucket
  auth,            // Firebase Auth
  hasFirebaseConfig, // Whether Firebase is configured
  verifyIdToken,   // Helper function to verify tokens
  getUserById      // Helper function to get user data
};