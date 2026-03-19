// ─────────────────────────────────────────────────────────────────────────────
// FIREBASE CONFIGURATION
// Create a .env.local file (see .env.example) and fill in your Firebase values.
// In the Firebase Console: Project Settings → Your apps → Firebase SDK snippet
// ─────────────────────────────────────────────────────────────────────────────

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Firestore with offline persistence — required for PWA offline support
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});
