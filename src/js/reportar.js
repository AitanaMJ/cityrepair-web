import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const form = document.getElementById("form-reporte");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Debes iniciar sesión para enviar reportes.");
    window.location.href = "./login.html";
    return;
  }

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
      alert("Por favor completa todos los campos obligatorios.");
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

      sessionStorage.setItem("flash", "✅ Reporte enviado con éxito");
      form.reset();
      window.location.href = "./mis-reportes.html";
    } catch (error) {
      console.error("Error al enviar reporte:", error);
      alert("❌ Error al enviar reporte.");
    }
  });
});