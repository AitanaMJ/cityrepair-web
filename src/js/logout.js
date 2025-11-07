// src/js/logout.js
import { auth } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const logoutButtons = [
    document.querySelector("[data-logout]"),
    document.getElementById("drawerLogout"),
    document.getElementById("btn-logout"),
  ].filter(Boolean);

  if (logoutButtons.length === 0) {
    console.warn("No se encontraron botones de logout en esta página.");
    return;
  }

  // mostrar / ocultar según sesión
  onAuthStateChanged(auth, (user) => {
    logoutButtons.forEach((btn) => (btn.hidden = !user));
  });

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);

      window.mostrarAlerta?.("Sesión cerrada correctamente", "success", {
        titulo: "Hasta pronto",
      });

      setTimeout(() => {
        window.location.href = "/pages/login.html";
      }, 800);
    } catch (err) {
      console.error("Error al cerrar sesión:", err);
      window.mostrarAlerta?.("No se pudo cerrar la sesión", "danger", {
        titulo: "Error",
      });
    }
  };

  logoutButtons.forEach((btn) => btn.addEventListener("click", handleLogout));
});