// src/js/firebase-auth-sync.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { setAuth } from "./auth.js";

onAuthStateChanged(auth, (user) => {
  const AUTH_KEY = "cr_auth";

  if (user) {
    // ¿ya hay sesión manejada por la app? (ej. edet)
    const actual = (() => {
      try { return JSON.parse(localStorage.getItem(AUTH_KEY)); }
      catch { return null; }
    })();

    if (actual && actual.role) {
      // respetamos la sesión existente
      return;
    }

    // si no había nada, guardamos como ciudadano
    setAuth({
      email: user.email,
      uid: user.uid,
      role: "citizen",
    });

  } else {
    // no hay usuario en Firebase → limpiamos
    try { localStorage.removeItem(AUTH_KEY); } catch (e) {}
  }
});