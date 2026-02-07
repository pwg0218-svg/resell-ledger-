import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Original Config from src/firebase.js
const firebaseConfig = {
    apiKey: "AIzaSyCCI8gGD2BzuMyJsYwE1anuYi3hkZLj4G0",
    authDomain: "resell-ledger.firebaseapp.com",
    projectId: "resell-ledger",
    storageBucket: "resell-ledger.firebasestorage.app",
    messagingSenderId: "695082740332",
    appId: "1:695082740332:web:9aa7fc998259cae5b08649",
    measurementId: "G-201BD3B467"
};

// Initialize Firebase (Singleton pattern for Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Added Storage
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, storage, googleProvider };
