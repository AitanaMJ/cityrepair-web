// src/js/contacto.js

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

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

if (!nombre || !correo || !asunto || !mensaje) {
  window.mostrarAlerta?.("Completá todos los campos.", "warn", "Campos obligatorios");
  return;
}

if (!emailValido) {
  window.mostrarAlerta?.("Ingresá un correo válido.", "warn", "Email inválido");
  return;
}

    try {
  const contactos = JSON.parse(localStorage.getItem("contactos")) || [];

  contactos.push({
    id: Date.now(),
    nombre,
    correo,
    asunto,
    mensaje,
    creadoEn: new Date().toISOString(),
    leido: false,
  });

  localStorage.setItem("contactos", JSON.stringify(contactos));

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
