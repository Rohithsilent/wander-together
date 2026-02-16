// Firebase configuration
// Replace these values with your actual Firebase project config
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA9ytHS1IB89S2XLZH6_RRdn11RvveUmC4",
  authDomain: "wanderbuddy-4b130.firebaseapp.com",
  projectId: "wanderbuddy-4b130",
  storageBucket: "wanderbuddy-4b130.firebasestorage.app",
  messagingSenderId: "754580079870",
  appId: "1:754580079870:web:3191604261a05934d251af",
  measurementId: "G-0917B3Y9QH",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
