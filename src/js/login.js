// src/js/login.js

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
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      await minDelay(1000);

      if (!res.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      // ✅ Guardar sesión
      localStorage.setItem("cr_auth", JSON.stringify({
        email: data.user.email,
        role: data.user.role
      }));

      showToast("Inicio de sesión exitoso", "success", "Bienvenido");

      const TOAST_DURATION = 4000;

      setTimeout(() => setLoading(false), TOAST_DURATION - 300);

      // 🔥 REDIRECCIÓN SEGÚN ROL
      setTimeout(() => {
        if (data.user.role === "tecnico") {
          window.location.href = "tecnico-dashboard.html";
        } else {
          window.location.href = "mis-reportes.html";
        }
      }, TOAST_DURATION);

    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      showToast("Correo o contraseña incorrectos", "danger", "Error");

      setLoading(false);
      isSubmitting = false;
    }
  });
});