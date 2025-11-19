// src/js/perfil-admin.js
import { auth } from "./firebase.js";

auth.onAuthStateChanged((user) => {
  if (!user) return;

  const emailEl = document.getElementById("perfilEmail");
  const nombreEl = document.getElementById("perfilNombre");
  const avatarEl = document.getElementById("perfilAvatar");

  emailEl.textContent = user.email;
  nombreEl.textContent = user.displayName || "Administrador";

  const inicial = user.displayName ? user.displayName[0].toUpperCase() : "A";
  avatarEl.textContent = inicial;
});