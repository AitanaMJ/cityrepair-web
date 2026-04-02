// src/js/profile-menu.js
document.addEventListener("DOMContentLoaded", () => {
  const userMenuBtn     = document.getElementById("userMenuBtn");
  const userDropdown    = document.getElementById("userDropdown");
  const logoutFromMenu  = document.getElementById("logoutFromMenu");
  const goProfileBtn    = document.getElementById("goProfile");

  if (!userMenuBtn || !userDropdown) return;

  // ===============================
  // ABRIR / CERRAR MENÚ
  // ===============================
  userMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.hidden = !userDropdown.hidden;
  });

  document.addEventListener("click", () => {
    userDropdown.hidden = true;
  });

  // ===============================
  // IR AL PERFIL
  // ===============================
  if (goProfileBtn) {
    goProfileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      userDropdown.hidden = true;
      window.location.href = "/pages/perfil.html";
    });
  }

  // ===============================
  // CERRAR SESIÓN (LOCAL)
  // ===============================
  if (logoutFromMenu) {
    logoutFromMenu.addEventListener("click", (e) => {
      e.preventDefault();

      try {
        // borrar sesión
        localStorage.removeItem("cr_auth");

        // opcional: bandera para guards
        sessionStorage.setItem("cr_logging_out", "1");

        window.location.href = "/pages/login.html";
      } catch (err) {
        console.error("Error al cerrar sesión:", err);
      }
    });
  }
});