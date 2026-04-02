// perfil-tecnico.js
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const sessionRaw = localStorage.getItem("cr_auth");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;

  if (!session || session.role !== "tecnico") {
    window.location.href = "./tecnico-login.html";
    return;
  }

  // ===============================
  // ELEMENTOS DEL DOM
  // ===============================
  const fotoEl = document.getElementById("perfilFoto");
  const nombreEl = document.getElementById("perfilNombre");
  const emailEl = document.getElementById("perfilEmail");
  const uidEl = document.getElementById("perfilUid");

  // ===============================
  // FUNCIÓN: generar avatar automático
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
  // DATOS DESDE SESSION
  // ===============================
  const nombre = session.nombre || session.email.split("@")[0] || "Técnico";
  const correo = session.email || "";
  const avatar = generarAvatar(nombre);

  // ===============================
  // PINTAR PERFIL
  // ===============================
  if (fotoEl) {
    fotoEl.src = `https://ui-avatars.com/api/?name=${avatar}&background=2563eb&color=fff&size=256&bold=true`;
  }

  if (nombreEl) nombreEl.textContent = nombre;
  if (emailEl) emailEl.textContent = correo;
  if (uidEl) uidEl.textContent = session.uid || "local-user";

  // ===============================
  // ACTUALIZAR NAVBAR
  // ===============================
  const navbarAvatar = document.querySelector("[data-user-avatar]");
  const navbarName = document.querySelector("[data-user-name]");

  if (navbarAvatar) navbarAvatar.textContent = avatar;
  if (navbarName) navbarName.textContent = nombre;
});