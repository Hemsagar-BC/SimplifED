// Firebase Admin SDK initialization service for backend
// Uses service account credentials for server-side operations
// Provides access to Firestore database and Storage bucket
// Admin SDK has full read/write permissions - only use server-side!
// Environment variables required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

const admin = require('firebase-admin');

// Check if required environment variables exist
if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
  console.error('❌ Missing Firebase Admin SDK credentials in .env file!');
  console.error('Required: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
  process.exit(1);
}

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

} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  process.exit(1);
}

// Get Firestore database instance
// Used for reading/writing lecture data, segments, user info
const db = admin.firestore();

// Configure Firestore settings for better performance
db.settings({
  ignoreUndefinedProperties: true, // Ignore undefined values instead of throwing errors
});

// Get Firebase Storage bucket instance
// Used for storing audio files uploaded by users
const storage = admin.storage().bucket();

// Get Firebase Auth instance (for verifying user tokens if needed)
const auth = admin.auth();

// Helper function to verify Firebase ID tokens from frontend
async function verifyIdToken(token) {
  try {
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
  verifyIdToken,   // Helper function to verify tokens
  getUserById      // Helper function to get user data
};