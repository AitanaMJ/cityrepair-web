// src/js/edet-login.js
import { auth, db } from "./firebase.js";
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Solo permite correos corporativos de EDET
const emailOK = (email) => /@edet\.com\.ar$/i.test(email);

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("edet-login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const pass  = document.getElementById("password").value.trim();

    if (!emailOK(email)) {
      window.mostrarAlerta?.(
        "Usá tu correo corporativo @edet.com.ar",
        "danger",
        { titulo: "Email inválido" }
      );
      return;
    }

    try {
      // 1️⃣ Login con Firebase Auth
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const uid  = cred.user.uid;

      // 2️⃣ Buscar el documento del usuario en Firestore
      const snap = await getDoc(doc(db, "usuarios", uid));
      const data = snap.data() || {};

      // Rol normalizado (por si está en mayúsculas / minúsculas mezcladas)
      const rol = (data.rol || "").toLowerCase();

      // 3️⃣ Redirección según rol
      if (rol === "admin" || rol === "edet") {
        // Compatibilidad: si antes usabas rol = "edet", lo tratamos como admin
        window.mostrarAlerta?.("Bienvenido al panel administrador", "success", {
          titulo: "EDET – Admin"
        });
        setTimeout(() => {
          window.location.href = "./edet-dashboard.html";
        }, 700);

      } else if (rol === "tecnico") {
        window.mostrarAlerta?.("Bienvenido al panel del técnico", "success", {
          titulo: "EDET – Técnico"
        });
        setTimeout(() => {
          window.location.href = "./tecnico-dashboard.html";
        }, 700);

      } else {
        // Existe en Auth pero no tiene rol válido de EDET
        window.mostrarAlerta?.(
          "Tu cuenta no tiene permisos de EDET (admin o técnico).",
          "danger",
          { titulo: "Acceso denegado" }
        );
      }

    } catch (err) {
      console.error(err);
      window.mostrarAlerta?.("Credenciales inválidas", "danger", {
        titulo: "Error de acceso"
      });
    }
  });
});
