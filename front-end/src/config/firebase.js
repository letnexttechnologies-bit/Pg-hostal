// Import needed Firebase SDK modules
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCcv4N5mtmhiWLCrGZi3_4nqwN3yH4azWU",
  authDomain: "pg-hostel-812d7.firebaseapp.com",
  projectId: "pg-hostel-812d7",
  storageBucket: "pg-hostel-812d7.firebasestorage.app",
  messagingSenderId: "724128889770",
  appId: "1:724128889770:web:b69da0c1c99252d7ecc9d3",
  measurementId: "G-7BRY4NE8ZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore (Client SDK)
export const db = getFirestore(app);  
