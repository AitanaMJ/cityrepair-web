// src/js/firebase.js
// Usamos los módulos ESM desde el CDN de Firebase 12.x

import { initializeApp }   from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAuth }         from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { getFirestore }    from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { getStorage }      from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";

// 🔹 Config de tu proyecto (la misma que pegaste, pero con el bucket corregido)
const firebaseConfig = {
  apiKey: "AIzaSyBk0QSRXayfX3YSiyzGUtNn6MNklYZY2hU",
  authDomain: "city-repair.firebaseapp.com",
  projectId: "city-repair",
  storageBucket: "city-repair.appspot.com",   // 👈 ESTE
  messagingSenderId: "608570443801",
  appId: "1:608570443801:web:41e53391559e120b488288"
};

// Inicializar Firebase
const app     = initializeApp(firebaseConfig);
const auth    = getAuth(app);
const db      = getFirestore(app);
const storage = getStorage(app);

// exportamos para poder usarlo en login.js, register.js, reportar.js, edet-dashboard.js, etc.
export { app, auth, db, storage };