// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "apptechnestsai.firebaseapp.com",
  projectId: "apptechnestsai",
  storageBucket: "apptechnestsai.firebasestorage.app",
  messagingSenderId: "352465214874",
  appId: "1:352465214874:web:e8cdfa54ff6bf3cfc4ae23"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);