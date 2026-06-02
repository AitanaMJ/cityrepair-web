// register.js — Registro conectado al backend MySQL

const API = "http://localhost:3000/api";

const form = document.querySelector("form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email    = form.querySelector("input[type='email']")?.value?.trim();
    const password = form.querySelector("input[type='password']")?.value?.trim();

    if (!email || !password) {
      alert("Completá email y contraseña");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      const res  = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al registrarse");
        return;
      }

      alert("✅ Cuenta creada correctamente. Ya podés iniciar sesión.");
      window.location.href = "./login.html";

    } catch (err) {
      alert("❌ No se pudo conectar al servidor. Verificá que esté corriendo.");
    }
  });
}