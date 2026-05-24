import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// These values should be in an .env file
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Check if Firebase config is valid
const isFirebaseConfigValid = Object.entries(firebaseConfig).every(([key, val]) => {
  if (val === undefined || val === "" || val === "your-api-key") {
    console.warn(`Firebase Config Warning: ${key} is missing or has placeholder value.`);
    return false;
  }
  return true;
});

if (!isFirebaseConfigValid) {
  console.error("Firebase Configuration Error: Missing or invalid environment variables. Please check your .env file.");
  console.log("Current Config (Masked):", {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.slice(0, 5)}...` : "MISSING",
    projectId: firebaseConfig.projectId || "MISSING",
    authDomain: firebaseConfig.authDomain || "MISSING"
  });
}

// Initialize Firebase with fallback to prevent immediate app crash if config is missing
const app = isFirebaseConfigValid ? initializeApp(firebaseConfig) : initializeApp({
  apiKey: "dummy-key-for-initialization",
  authDomain: "dummy-domain.firebaseapp.com",
  projectId: "dummy-project-id",
  appId: "1:1234567890:web:abcdef"
});

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
