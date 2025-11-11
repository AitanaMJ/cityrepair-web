// src/js/forgot-password.js
import { auth } from "./firebase.js";
import { sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const link = document.getElementById("forgotPassLink");
  const emailInput = document.getElementById("email");

  if (!link) return;

  link.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (!email) {
      // usa tu toast global
      window.mostrarAlerta?.(
        "Escribí primero tu correo en el campo de arriba.",
        "warn",
        { titulo: "Falta el correo" }
      );
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      window.mostrarAlerta?.(
        "Te enviamos un correo para restablecer la contraseña. Revisá SPAM.",
        "success",
        { titulo: "Listo ✅" }
      );
    } catch (err) {
      console.error(err);
      window.mostrarAlerta?.(
        "No pudimos enviar el correo. ¿Ese mail está registrado?",
        "error",
        { titulo: "No se pudo enviar" }
      );
    }
  });
});

