// src/js/login.js (SIN Firebase)

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

  const minDelay = async (ms = 1000) => {
    return new Promise((r) => setTimeout(r, ms));
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
      // ⬇️ Buscar usuario en localStorage
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

      const usuario = usuarios.find(
        u => u.email === email && u.password === password
      );

      await minDelay(1000);

      if (!usuario) {
        throw new Error("Credenciales incorrectas");
      }

      // Guardar sesión activa
      localStorage.setItem("cr_auth", JSON.stringify({
        email: usuario.email,
        role: usuario.role || "citizen"
      }));

      showToast("Inicio de sesión exitoso", "success", "Bienvenido");

      const TOAST_DURATION = 4000;

      setTimeout(() => setLoading(false), TOAST_DURATION - 300);

      setTimeout(() => {
        window.location.href = "mis-reportes.html";
      }, TOAST_DURATION);

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      showToast("Correo o contraseña incorrectos", "danger", "Error");
      setLoading(false);
      isSubmitting = false;
    }
  });
});

