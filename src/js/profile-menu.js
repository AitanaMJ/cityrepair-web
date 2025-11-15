// src/js/profile-menu.js
document.addEventListener("DOMContentLoaded", () => {
  const userMenuBtn     = document.getElementById("userMenuBtn");
  const userDropdown    = document.getElementById("userDropdown");
  const logoutFromMenu  = document.getElementById("logoutFromMenu");
  const goProfileBtn    = document.getElementById("goProfile");

  if (!userMenuBtn || !userDropdown) return;

  // abrir/cerrar menú al hacer click en el avatar/nombre
  userMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.hidden = !userDropdown.hidden;
  });

  // cerrar si se hace click fuera
  document.addEventListener("click", () => {
    userDropdown.hidden = true;
  });

  // ir a la página de perfil
  if (goProfileBtn) {
    goProfileBtn.addEventListener("click", (e) => {
      e.preventDefault();
      userDropdown.hidden = true;
      window.location.href = "/pages/perfil.html";
    });
  }

  // cerrar sesión desde el menú
  if (logoutFromMenu) {
    logoutFromMenu.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        const { signOut } = await import("https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js");
        const { auth }    = await import("./firebase.js");
        await signOut(auth);
        window.location.href = "/pages/login.html";
      } catch (err) {
        console.error("Error al cerrar sesión:", err);
      }
    });
  }
});