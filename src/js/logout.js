// src/js/logout.js
import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// Seleccionamos todos los botones posibles
const logoutBtns = document.querySelectorAll("[data-logout], #drawerLogout");

logoutBtns.forEach((btn) => {
  btn.addEventListener("click", async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      console.log("✅ Sesión cerrada correctamente");
      window.location.href = "/pages/login.html";
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error);
    }
  });
});