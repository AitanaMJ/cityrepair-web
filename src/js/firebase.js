import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBk0QSRXayfX3YSiyzGUtNn6MNklYZY2hU",
  authDomain: "city-repair.firebaseapp.com",
  projectId: "city-repair",
  storageBucket: "city-repair.firebasestorage.app",
  messagingSenderId: "608570443801",
  appId: "1:608570443801:web:41e53391559e120b488288"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
