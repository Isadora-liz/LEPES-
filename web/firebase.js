import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-analytics.js";

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
    const analytics = getAnalytics(app);
  export const db = getFirestore(app);
  export const auth = getAuth(app);

