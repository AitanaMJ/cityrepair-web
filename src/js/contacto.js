// src/js/contacto.js
import { db } from "./firebase.js";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  if (!form) return;

  // cache de controles (los ids deben existir tal cual en el HTML)
  const elNombre  = document.getElementById("nombre");
  const elCorreo  = document.getElementById("correo");
  const elAsunto  = document.getElementById("asunto");
  const elMensaje = document.getElementById("mensaje");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // lee valores (si algún el* es null, acá lo vas a ver enseguida)
    const nombre  = elNombre?.value.trim()  || "";
    const correo  = elCorreo?.value.trim()  || "";
    const asunto  = elAsunto?.value.trim()  || "";
    const mensaje = elMensaje?.value.trim() || "";

    if (!nombre || !correo || !asunto || !mensaje) {
      window.mostrarAlerta?.(
        "Completá todos los campos.",
        "warn",
        "Campos obligatorios"
      ) || alert("Completá todos los campos.");
      return;
    }

    try {
      // ID personalizado (ej: contacto-20251111-abc123)
      const customId =
        "contacto-" +
        new Date().toISOString().slice(0,10).replaceAll("-", "") +
        "-" +
        Math.random().toString(36).slice(2, 8);

      await setDoc(doc(db, "contactos", customId), {
        nombre,
        correo,
        asunto,
        mensaje,
        creadoEn: serverTimestamp(),
        leido: false,
      });

      window.mostrarAlerta?.(
        "Tu mensaje se envió correctamente. ¡Gracias por escribirnos!",
        "success",
        "Enviado"
      ) || alert("Mensaje enviado correctamente.");

      form.reset();
    } catch (err) {
      console.error("Error guardando contacto:", err);
      window.mostrarAlerta?.(
        "No pudimos enviar el mensaje. Probá de nuevo en unos instantes.",
        "danger",
        "Error"
      ) || alert("No se pudo enviar el mensaje.");
    }
  });
});
