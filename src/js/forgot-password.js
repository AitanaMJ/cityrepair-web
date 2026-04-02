// src/js/forgot-password.js (SIN Firebase)

document.addEventListener("DOMContentLoaded", () => {
  const link = document.getElementById("forgotPassLink");
  const emailInput = document.getElementById("email");

  if (!link) return;

  link.addEventListener("click", (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    if (!email) {
      window.mostrarAlerta?.(
        "Escribí primero tu correo en el campo de arriba.",
        "warn",
        { titulo: "Falta el correo" }
      );
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuario = usuarios.find(u => u.email === email);

    if (!usuario) {
      window.mostrarAlerta?.(
        "Ese correo no está registrado.",
        "danger",
        { titulo: "Usuario no encontrado" }
      );
      return;
    }

    // 🔐 Simulación
    window.mostrarAlerta?.(
      "Simulación: En un sistema real recibirías un email para cambiar tu contraseña.",
      "info",
      { titulo: "Modo demo" }
    );
  });
});

