// src/js/perfil-admin.js

document.addEventListener("DOMContentLoaded", () => {
  const sessionRaw = localStorage.getItem("cr_auth");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;

  if (!session) {
    window.location.href = "../login.html";
    return;
  }

  const session = JSON.parse(localStorage.getItem("cr_auth"));

if (!session || session.role !== "admin") {
  window.location.href = "./login.html";
}

  const emailEl = document.getElementById("perfilEmail");
  const nombreEl = document.getElementById("perfilNombre");
  const avatarEl = document.getElementById("perfilAvatar");

  const email = session.email || "admin@correo.com";
  const nombre = email.split("@")[0];

  if (emailEl) emailEl.textContent = email;
  if (nombreEl) nombreEl.textContent = nombre;

  const inicial = nombre[0]?.toUpperCase() || "A";
  if (avatarEl) avatarEl.textContent = inicial;
});