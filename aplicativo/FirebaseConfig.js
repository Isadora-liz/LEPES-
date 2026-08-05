// Import the functions you need from the SDKs you need
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQHHNMr8qbBLIeEdMPhtosjgI6JxNhR3g",
  authDomain: "teste-lepesadmin.firebaseapp.com",
  projectId: "teste-lepesadmin",
  storageBucket: "teste-lepesadmin.firebasestorage.app",
  messagingSenderId: "976198499922",
  appId: "1:976198499922:web:b51bfa9e86faf2c28fa98b",
  measurementId: "G-NKH9RS2ZBL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
})

