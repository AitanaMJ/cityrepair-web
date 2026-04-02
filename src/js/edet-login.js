// src/js/edet-login.js


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
  // Obtener usuarios guardados en localStorage
  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Buscar usuario por email
  const user = usuarios.find(u => 
    u.email.toLowerCase() === email.toLowerCase() &&
    u.password === pass
  );

  if (!user) {
    window.mostrarAlerta?.("Credenciales inválidas", "danger", {
      titulo: "Error de acceso"
    });
    return;
  }

  const rol = (user.rol || "").toLowerCase();

  // Guardar sesión
  localStorage.setItem("session", JSON.stringify({
    email: user.email,
    rol: user.rol
  }));

  if (rol === "admin" || rol === "edet") {
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
    window.mostrarAlerta?.(
      "Tu cuenta no tiene permisos de EDET.",
      "danger",
      { titulo: "Acceso denegado" }
    );
  }

} catch (err) {
  console.error(err);
  window.mostrarAlerta?.("Error inesperado", "danger", {
    titulo: "Error"
  });
}
  });
});
