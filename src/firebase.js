// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCCI8gGD2BzuMyJsYwE1anuYi3hkZLj4G0",
    authDomain: "resell-ledger.firebaseapp.com",
    projectId: "resell-ledger",
    storageBucket: "resell-ledger.firebasestorage.app",
    messagingSenderId: "695082740332",
    appId: "1:695082740332:web:9aa7fc998259cae5b08649",
    measurementId: "G-201BD3B467"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
