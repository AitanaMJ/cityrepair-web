// src/js/auth-guard.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

// para no mostrar alerta en el primer render, cuando Firebase aún no respondió
let firstCheck = true;

onAuthStateChanged(auth, (user) => {
  if (user) {
    // ya hay sesión, listo
    firstCheck = false;
    return;
  }

  // si es el primer chequeo, solo esperamos y mostramos algo liviano si querés
  if (firstCheck) {
    firstCheck = false;
    return; // NO alert acá
  }

  // de acá para abajo es realmente que no hay sesión
  if (typeof window.mostrarAlerta === "function") {
    window.mostrarAlerta(
      "Debes iniciar sesión para continuar.",
      "warn",
      { titulo: "Sesión requerida" }
    );
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 700);
  } else {
    alert("Debes iniciar sesión para continuar.");
    window.location.href = "./login.html";
  }
});
