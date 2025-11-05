// src/js/login.js
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  if (!form) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  let isSubmitting = false;

  const showToast = (msg, tipo = "info", titulo = "") => {
    if (typeof window.mostrarAlerta === "function") {
      window.mostrarAlerta(msg, tipo, { titulo });
    } else {
      alert(msg);
    }
  };

  // espera mínima de 1 s antes de mostrar el toast (sensación de carga real)
  const minDelay = async (promise, ms = 1000) => {
    const wait = new Promise((r) => setTimeout(r, ms));
    const [result] = await Promise.allSettled([promise, wait]);
    if (result.status === "rejected") throw result.reason;
    return result.value;
  };

  const setLoading = (loading) => {
    if (!submitBtn) return;
    if (loading) {
      submitBtn.dataset.prevText = submitBtn.textContent;
      submitBtn.textContent = "Iniciando sesión…";
      submitBtn.disabled = true;
      form.querySelectorAll("input,button").forEach(el => (el.disabled = true));
    } else {
      submitBtn.textContent = submitBtn.dataset.prevText || "Iniciar Sesión";
      form.querySelectorAll("input,button").forEach(el => (el.disabled = false));
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    const email = document.querySelector("#email").value.trim();
    const password = document.querySelector("#password").value.trim();

    if (!email || !password) {
      showToast("Por favor completa todos los campos.", "warn", "Campos vacíos");
      isSubmitting = false;
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      const { user } = await minDelay(
        signInWithEmailAndPassword(auth, email, password),
        1000
      );

      // guarda datos del usuario en localStorage (usado por app.js)
      localStorage.setItem("cr_auth", JSON.stringify({
        email: user.email,
        uid: user.uid,
        role: "citizen"
      }));

      // muestra toast
      showToast("Inicio de sesión exitoso", "success", "Bienvenido");

      // sincroniza con el tiempo del toast (4 s)
      const TOAST_DURATION = 4000;

      // liberar el botón justo al final del toast
      setTimeout(() => setLoading(false), TOAST_DURATION - 300);

      // redirigir cuando termina la animación de la barra del toast
      setTimeout(() => {
        window.location.href = "mis-reportes.html";
      }, TOAST_DURATION);

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      await new Promise((r) => setTimeout(r, 500));
      showToast("Correo o contraseña incorrectos", "danger", "Error");
      setLoading(false);
      isSubmitting = false;
    }
  });
});

