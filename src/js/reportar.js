// src/js/reportar.js
import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const form = document.getElementById("form-reporte");

// bandera solo en memoria (no localStorage)
let firstAuthCheck = true;

onAuthStateChanged(auth, (user) => {
  // ⛔ no hay usuario
  if (!user) {
    // primera vez que Firebase avisa: no molestamos
    if (firstAuthCheck) {
      firstAuthCheck = false;
      return;
    }

    // ya no está logueado → avisamos bonito y mandamos al login
    if (typeof window.mostrarAlerta === "function") {
      window.mostrarAlerta(
        "Debes iniciar sesión para enviar reportes.",
        "warn",
        { titulo: "Sesión requerida" }
      );
      // damos un pelín de tiempo para que se vea el toast
      setTimeout(() => (window.location.href = "./login.html"), 800);
    } else {
      alert("Debes iniciar sesión para enviar reportes.");
      window.location.href = "./login.html";
    }
    return;
  }

  // ✅ hay usuario
  firstAuthCheck = false;

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tipo = document.getElementById("tipo").value.trim();
    const ubicacion =
      document.getElementById("ubicacion")?.value.trim() ||
      document.getElementById("direccion")?.value.trim() ||
      "";
    const descripcion = document.getElementById("descripcion").value.trim();
    const zona = document.getElementById("zona")?.value.trim() || "";

    if (!tipo || !ubicacion || !descripcion) {
      if (typeof window.mostrarAlerta === "function") {
        window.mostrarAlerta(
          "Completá los campos obligatorios.",
          "warn",
          { titulo: "Falta info" }
        );
      } else {
        alert("Por favor completa todos los campos obligatorios.");
      }
      return;
    }

    try {
      await addDoc(collection(db, "reportes"), {
        usuarioId: user.uid,
        tipo,
        ubicacion,
        descripcion,
        zona,
        estado: "pendiente",
        fecha: serverTimestamp()
      });

      // ✅ toast lindo
      if (typeof window.mostrarAlerta === "function") {
        window.mostrarAlerta(
          "Reporte enviado con éxito.",
          "success",
          { titulo: "Listo" }
        );
        // después de mostrarlo, ir a Mis reportes
        setTimeout(() => {
          window.location.href = "./mis-reportes.html";
        }, 900);
      } else {
        alert("✅ Reporte enviado con éxito");
        window.location.href = "./mis-reportes.html";
      }
    } catch (error) {
      console.error("Error al enviar reporte:", error);
      if (typeof window.mostrarAlerta === "function") {
        window.mostrarAlerta(
          "No se pudo enviar el reporte.",
          "danger",
          { titulo: "Error" }
        );
      } else {
        alert("❌ Error al enviar reporte.");
      }
    }
  });
});
