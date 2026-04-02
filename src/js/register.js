// src/js/register.js

const form = document.querySelector("form");

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = form.querySelector("input[type='email']")?.value?.trim();
    const password = form.querySelector("input[type='password']")?.value?.trim();

    if (!email || !password) {
      alert("Completá email y contraseña");
      return;
    }

    // Obtener usuarios existentes
    const usuarios = JSON.parse(localStorage.getItem("cr_users")) || [];

    // Verificar si el usuario ya existe
    const existe = usuarios.find(u => u.email === email);
    if (existe) {
      alert("⚠️ Este correo ya está registrado");
      return;
    }

    // Crear nuevo usuario
    const nuevoUsuario = {
      id: Date.now().toString(),
      email,
      password, // ⚠️ En producción esto debe ir encriptado (backend)
      role: "citizen",
      fechaRegistro: new Date().toISOString()
    };

    usuarios.push(nuevoUsuario);

    // Guardar usuarios
    localStorage.setItem("cr_users", JSON.stringify(usuarios));

    alert("✅ Usuario registrado correctamente");

    // Redirigir a login
    location.href = "login.html";
  });
}
