// register.js

const API = "http://localhost:3000/api";
const CODIGO_TECNICO = "TEC#9182";

document.addEventListener("DOMContentLoaded", () => {
  const rolSelect    = document.getElementById("rol");
  const grupoCodigo  = document.getElementById("grupoCodigo");

  // Mostrar/ocultar campo de código según el rol elegido
  rolSelect?.addEventListener("change", () => {
    grupoCodigo.style.display = rolSelect.value === "tecnico" ? "block" : "none";
    document.getElementById("codigoTecnico").value = "";
  });

  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre   = document.getElementById("nombre")?.value.trim();
    const email    = document.getElementById("email")?.value.trim();
    const password = document.getElementById("password")?.value.trim();
    const confirmar = document.getElementById("confirmar")?.value.trim();
    const rolRadio = document.querySelector("input[name='rol']:checked");
    const rol      = rolRadio ? rolRadio.value : "citizen";
    const codigo   = document.getElementById("codigoTecnico")?.value.trim();

    // Validaciones
    if (!nombre || !email || !password || !confirmar) {
      alert("Por favor completá todos los campos obligatorios.");
      return;
    }

    if (password.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (password !== confirmar) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (rol === "tecnico") {
      if (!codigo) {
        alert("Ingresá el código de técnico para continuar.");
        return;
      }
      if (codigo !== CODIGO_TECNICO) {
        alert("❌ Código de técnico incorrecto. Contactá al administrador de EDET.");
        return;
      }
    }

    try {
      const res  = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: rol, nombre })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error al registrarse.");
        return;
      }

      const rolTexto = rol === "tecnico" ? "técnico" : "ciudadano";
      alert(`✅ Cuenta de ${rolTexto} creada correctamente. Ya podés iniciar sesión.`);
      window.location.href = "./login.html";

    } catch (err) {
      alert("❌ No se pudo conectar al servidor. Verificá que esté corriendo.");
    }
  });
});