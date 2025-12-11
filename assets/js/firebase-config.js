// Firebase Configuration
// WICHTIG: Diese API Keys sind für Client-seitige Nutzung gedacht und können öffentlich sein
// Die Sicherheit wird durch Firebase Security Rules gewährleistet

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyCmh6usqZJeeFgYwaJ6ixOhWVqE3zCaNDs",
  authDomain: "ml-vision-273ee.firebaseapp.com",
  projectId: "ml-vision-273ee",
  storageBucket: "ml-vision-273ee.firebasestorage.app",
  messagingSenderId: "669617565330",
  appId: "1:669617565330:web:5c9dc431f845113f0c804b",
  measurementId: "G-GC3V20GJ3R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Export für Verwendung in anderen Dateien
export { app, auth, db, storage, analytics };
