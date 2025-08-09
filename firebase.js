// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  setDoc, 
  getDoc, 
  doc, 
  onSnapshot, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs 
} from "firebase/firestore"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCS9uH1fLd95qNCZ6BHuo1MtzeY4h1ZCcg",
  authDomain: "student-schedule-manager-8c242.firebaseapp.com",
  projectId: "student-schedule-manager-8c242",
  storageBucket: "student-schedule-manager-8c242.appspot.com",
  messagingSenderId: "972917836310",
  appId: "1:972917836310:web:03204d72e24e6e2b84c337"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore and export it
const db = getFirestore(app);

// Export Firestore instance and commonly used Firestore functions
export { 
  db, 
  setDoc, 
  getDoc, 
  doc, 
  onSnapshot, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs 
};