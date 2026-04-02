// src/js/auth-guard.js

const AUTH_KEY = "cr_auth";

function getAuth() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEY)) || null;
  } catch {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const user = getAuth();

  if (!user) {
    if (typeof window.mostrarAlerta === "function") {
      window.mostrarAlerta(
        "Debes iniciar sesión para continuar.",
        "warn",
        { titulo: "Sesión requerida" }
      );

      setTimeout(() => {
        window.location.href = "./login.html";
      }, 800);
    } else {
      alert("Debes iniciar sesión para continuar.");
      window.location.href = "./login.html";
    }
  }
});