document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("edet-login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      window.mostrarAlerta?.("Completá todos los campos", "warn");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = res.status === 403
          ? data.error
          : "Credenciales inválidas";
        window.mostrarAlerta?.(msg, "danger", { titulo: "Acceso denegado" });
        return;
      }

      const user = data.user;
      const rol = (user.role || "").toLowerCase();

      // ✅ Guardar sesión (igual que el login normal)
      localStorage.setItem("cr_auth", JSON.stringify({
        email: user.email,
        role: user.role
      }));

      // 🔥 VALIDACIÓN POR ROL (NO POR EMAIL)
      if (rol === "admin") {
        window.mostrarAlerta?.("Bienvenido administrador", "success");
        setTimeout(() => {
          window.location.href = "perfil-admin.html";
        }, 800);

      } else if (rol === "tecnico") {
        window.mostrarAlerta?.("Bienvenido técnico", "success");
        setTimeout(() => {
          window.location.href = "tecnico-dashboard.html";
        }, 800);

      } else {
        window.mostrarAlerta?.(
          "No tenés acceso a este portal",
          "danger"
        );
        localStorage.removeItem("cr_auth");
      }

    } catch (err) {
      console.error(err);
      window.mostrarAlerta?.("Error del servidor", "danger");
    }
  });
});