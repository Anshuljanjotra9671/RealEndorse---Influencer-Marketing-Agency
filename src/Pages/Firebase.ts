// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCGxmdW5EU6Jdl-uc9fOFUIXwGzlKKO5wg",
  authDomain: "realendorse-7c8b7.firebaseapp.com",
  projectId: "realendorse-7c8b7",
  storageBucket: "realendorse-7c8b7.appspot.com", // ✅ FIXED this line
  messagingSenderId: "217525490515",
  appId: "1:217525490515:web:90fad9f918b484e35f07a6",
  measurementId: "G-WQ21TTXFPX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth setup
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
