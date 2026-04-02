// src/js/navbar-auth.js

const loginLink    = document.querySelector("[data-login-link]");
const logoutLink   = document.querySelector("[data-logout]");
const drawerLogin  = document.getElementById("drawerLogin");
const drawerLogout = document.getElementById("drawerLogout");

// perfil
const userPanel    = document.querySelector("[data-user-panel]");
const userNameSpan = document.querySelector("[data-user-name]");
const userAvatar   = document.querySelector("[data-user-avatar]");

document.addEventListener("DOMContentLoaded", () => {
  const sessionRaw = localStorage.getItem("cr_auth");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;

  if (session) {
    // estado logueado
    if (loginLink) loginLink.hidden = true;
    if (drawerLogin) drawerLogin.hidden = true;
    if (logoutLink) logoutLink.hidden = false;
    if (drawerLogout) drawerLogout.hidden = false;

    if (userPanel) {
      userPanel.hidden = false;

      const nombre = session.email?.split("@")[0] || "Usuario";

      if (userNameSpan) userNameSpan.textContent = nombre;

      if (userAvatar) {
        userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre)}&background=0f62fe&color=fff`;
      }
    }

  } else {
    // estado no logueado
    if (loginLink) loginLink.hidden = false;
    if (drawerLogin) drawerLogin.hidden = false;
    if (logoutLink) logoutLink.hidden = true;
    if (drawerLogout) drawerLogout.hidden = true;
    if (userPanel) userPanel.hidden = true;
  }
});