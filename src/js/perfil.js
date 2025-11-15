// src/js/perfil.js
import { auth, db, storage } from "./firebase.js";

import {
  onAuthStateChanged,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";

// ==== Elementos del DOM ====
const fotoPerfil = document.getElementById("fotoPerfil");
const nombrePerfil = document.getElementById("nombrePerfil");
const emailPerfil = document.getElementById("emailPerfil");

const uidPerfil = document.getElementById("perfilUID");
const creacionPerfil = document.getElementById("perfilCreacion");
const ultimoLoginPerfil = document.getElementById("perfilUltimoLogin");

const totalReportesEl = document.getElementById("perfilTotalReportes");
const pendientesEl = document.getElementById("perfilPendientes");
const resueltosEl = document.getElementById("perfilResueltos");

const btnCambiarFoto = document.getElementById("btnCambiarFoto");
const inputFoto = document.getElementById("inputFoto");

// ==== Cargar datos del usuario ====

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./login.html";
    return;
  }

  // ==== Mostrar info básica =====
  fotoPerfil.src = user.photoURL || "../src/img/default-avatar.png";
  nombrePerfil.textContent = user.displayName || "Usuario sin nombre";
  emailPerfil.textContent = user.email;

  uidPerfil.textContent = user.uid;
  creacionPerfil.textContent = user.metadata.creationTime || "N/A";
  ultimoLoginPerfil.textContent = user.metadata.lastSignInTime || "N/A";

  // ==== Estadísticas de reportes ====
  try {
    const q = query(
      collection(db, "reportes"),
      where("usuarioId", "==", user.uid)
    );

    const snap = await getDocs(q);

    let total = 0;
    let pendientes = 0;
    let resueltos = 0;

    snap.forEach((doc) => {
      total++;

      const estado = (doc.data().estado || "pendiente").toLowerCase();

      if (estado === "pendiente") pendientes++;
      if (estado === "resuelto") resueltos++;
    });

    totalReportesEl.textContent = total;
    pendientesEl.textContent = pendientes;
    resueltosEl.textContent = resueltos;

  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
  }
});

// ==== Cambio de foto de perfil ====

btnCambiarFoto.addEventListener("click", () => inputFoto.click());

inputFoto.addEventListener("change", async (e) => {
  const archivo = e.target.files[0];
  if (!archivo) return;

  const user = auth.currentUser;
  if (!user) return;

  try {
    const ruta = `avatars/${user.uid}.jpg`;
    const storageRef = ref(storage, ruta);

    // Subir archivo
    await uploadBytes(storageRef, archivo);
    const url = await getDownloadURL(storageRef);

    // Actualizar perfil de Firebase Auth
    await updateProfile(user, { photoURL: url });

    fotoPerfil.src = url;

    if (typeof window.mostrarAlerta === "function") {
      window.mostrarAlerta("Foto actualizada correctamente.", "success");
    } else {
      alert("Foto actualizada correctamente.");
    }

  } catch (error) {
    console.error("Error al subir foto:", error);
    if (typeof window.mostrarAlerta === "function") {
      window.mostrarAlerta("No se pudo cambiar la foto.", "danger");
    } else {
      alert("Error al cambiar foto.");
    }
  }
});