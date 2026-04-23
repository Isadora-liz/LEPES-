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
  apiKey: "AIzaSyBV3CbmauARJN8h7SUPDtm21cDU8Ua8SXs",
  authDomain: "lepes-teste.firebaseapp.com",
  projectId: "lepes-teste",
  storageBucket: "lepes-teste.firebasestorage.app",
  messagingSenderId: "613109882589",
  appId: "1:613109882589:web:84e19871bfdcb447418534",
  measurementId: "G-0K800GEWV2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
})