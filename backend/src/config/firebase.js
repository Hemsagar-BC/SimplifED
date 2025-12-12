/**
 * Firebase Admin SDK Configuration
 * 
 * This file initializes Firebase Admin SDK for server-side operations
 * Provides access to Firestore database, Storage bucket, and Auth
 * 
 * Required environment variables:
 * - FIREBASE_PROJECT_ID: Your Firebase project ID
 * - FIREBASE_CLIENT_EMAIL: Service account email
 * - FIREBASE_PRIVATE_KEY: Service account private key
 * 
 * Usage:
 * const { db, storage, admin } = require('./config/firebase');
 */

const admin = require('firebase-admin');

let db = null;
let storage = null;
let auth = null;

try {
  // Check if Firebase is already initialized
  if (!admin.apps.length) {
    // Initialize Firebase Admin SDK with service account credentials from environment
    const serviceAccount = {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
    };

    // Validate required credentials
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
      throw new Error(
        'Missing Firebase credentials in environment variables. Required: ' +
        'FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY'
      );
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });

    console.log('✅ Firebase Admin SDK initialized successfully');
  }

  // Get Firestore instance
  db = admin.firestore();
  console.log('✅ Firestore database initialized');

  // Get Storage bucket instance
  storage = admin.storage().bucket();
  console.log('✅ Firebase Storage initialized');

  // Get Auth instance
  auth = admin.auth();
  console.log('✅ Firebase Auth initialized');

} catch (error) {
  console.error('❌ Firebase initialization error:', error.message);
  console.log('⚠️ Firebase features will be disabled - app will run in development mode');
  // Don't throw - allow app to run without Firebase
}

module.exports = {
  admin,      // Full admin SDK access
  db,         // Firestore database (null if initialization failed)
  storage,    // Storage bucket (null if initialization failed)
  auth        // Firebase Auth (null if initialization failed)
};
