// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyASuQ7JZuVlFc5Gqgk5yDtW-_CrfyUaeIs",
  authDomain: "findajob-85ebe.firebaseapp.com",
  projectId: "findajob-85ebe",
  storageBucket: "findajob-85ebe.firebasestorage.app",
  messagingSenderId: "821404890609",
  appId: "1:821404890609:web:ee333bc2e9660c55f28050",
  measurementId: "G-ZWSHC4KVDQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

export { auth, db, storage, analytics };// Updated Firebase configuration 
