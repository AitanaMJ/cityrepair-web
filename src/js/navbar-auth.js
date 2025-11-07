import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { auth, db } from "./firebase.js";

const loginLink    = document.querySelector("[data-login-link]");
const logoutLink   = document.querySelector("[data-logout]");
const drawerLogin  = document.getElementById("drawerLogin");
const drawerLogout = document.getElementById("drawerLogout");

// perfil
const userPanel    = document.querySelector("[data-user-panel]");
const userNameSpan = document.querySelector("[data-user-name]");
const userAvatar   = document.querySelector("[data-user-avatar]");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    // 🔒 Usuario logueado
    if (loginLink) loginLink.hidden = true;
    if (drawerLogin) drawerLogin.hidden = true;
    if (logoutLink) logoutLink.hidden = false;
    if (drawerLogout) drawerLogout.hidden = false;

    // Mostrar perfil del usuario
    if (userPanel) {
      userPanel.hidden = false;

      // Intentar obtener datos extra desde Firestore
      let nombre = user.displayName || user.email?.split("@")[0] || "Usuario";
      let foto = user.photoURL || "";

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const datos = snap.data();
          if (datos.nombre) nombre = datos.nombre;
          if (datos.foto) foto = datos.foto;
        }
      } catch (err) {
        console.warn("No se pudo leer datos del perfil:", err);
      }

      // Si no hay foto en Firestore ni en Firebase, generar una por nombre
      if (!foto) {
        foto = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=ff4747&color=fff`;
      }

      if (userNameSpan) userNameSpan.textContent = nombre;
      if (userAvatar) userAvatar.src = foto;
    }

  } else {
    // 🚫 No logueado
    if (loginLink) loginLink.hidden = false;
    if (drawerLogin) drawerLogin.hidden = false;
    if (logoutLink) logoutLink.hidden = true;
    if (drawerLogout) drawerLogout.hidden = true;
    if (userPanel) userPanel.hidden = true;
  }
});