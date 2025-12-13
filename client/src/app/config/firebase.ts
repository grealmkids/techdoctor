// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDURVfkbYbJ4_C2r5tynlSj-pf1_3DFRdA",
    authDomain: "techdoctor2026.firebaseapp.com",
    projectId: "techdoctor2026",
    storageBucket: "techdoctor2026.firebasestorage.app",
    messagingSenderId: "612280320322",
    appId: "1:612280320322:web:5e4f704193303ab0b448db",
    measurementId: "G-S7L9QS23RD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app, analytics };
