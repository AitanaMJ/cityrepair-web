// ===============================
//  PERFIL DEL TÉCNICO – CityRepair
// ===============================

import {
  auth,
  db
} from "./firebase.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// ===============================
//  ELEMENTOS DEL DOM
// ===============================
const fotoEl = document.getElementById("perfilFoto");
const nombreEl = document.getElementById("perfilNombre");
const emailEl = document.getElementById("perfilEmail");
const uidEl = document.getElementById("perfilUid");

// ===============================
//  FUNCIÓN: generar avatar automático (círculo con iniciales)
// ===============================
function generarAvatar(nombreCompleto) {
  if (!nombreCompleto) return "TD";

  const partes = nombreCompleto.trim().split(" ");
  let iniciales = partes[0][0];

  if (partes.length > 1) {
    iniciales += partes[1][0];
  }

  return iniciales.toUpperCase();
}

// ===============================
//  AL CARGAR USUARIO
// ===============================
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./tecnico-login.html";
    return;
  }

  try {
    const ref = doc(db, "usuarios", user.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.error("No existe el usuario en Firestore");
      return;
    }

    const data = snap.data();

    // ===============================
    //  DATOS
    // ===============================
    const nombre = data.nombre || "Técnico";
    const correo = user.email || "";
    const avatar = generarAvatar(nombre);

    // ===============================
    //  PINTAR DATOS EN PERFIL
    // ===============================
    fotoEl.src = `https://ui-avatars.com/api/?name=${avatar}&background=2563eb&color=fff&size=256&bold=true`;
    nombreEl.textContent = nombre;
    emailEl.textContent = correo;
    uidEl.textContent = user.uid;

    // ===============================
    //  También actualizamos el avatar del navbar
    // ===============================
    const navbarAvatar = document.querySelector("[data-user-avatar]");
    const navbarName = document.querySelector("[data-user-name]");

    if (navbarAvatar) navbarAvatar.textContent = avatar;
    if (navbarName) navbarName.textContent = nombre;

  } catch (err) {
    console.error("Error cargando perfil del técnico:", err);
  }
});