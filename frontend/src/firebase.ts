import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// ─────────────────────────────────────────────────────────────────────────────
// ⚠️  FIREBASE SETUP REQUIRED
//
// 1. Go to https://console.firebase.google.com
// 2. Create a project (or select existing)
// 3. Add a Web App  →  copy the config object below
// 4. Enable Authentication  →  Email/Password + Google providers
// ─────────────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

/**
 * Returns true when the firebase config has been filled in by the user.
 * While the placeholder values are present the app runs in "setup mode".
 */
export const isFirebaseConfigured =
  !firebaseConfig.apiKey.startsWith('YOUR_') &&
  firebaseConfig.apiKey.length > 0;

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : (null as any);

export const auth         = isFirebaseConfigured ? getAuth(app) : (null as any);
export const googleProvider = new GoogleAuthProvider();

export default app;
