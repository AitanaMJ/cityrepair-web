// src/js/logout.js (SIN Firebase)

const btnLogout = document.querySelector("[data-logout]");

if (btnLogout) {
  btnLogout.addEventListener("click", (e) => {
    e.preventDefault();

    // Avisamos que es logout voluntario (si usás un guard)
    sessionStorage.setItem("cr_logging_out", "1");

    // 🔥 Eliminar sesión
    localStorage.removeItem("cr_auth");

    // Opcional: eliminar otras sesiones si usás
    localStorage.removeItem("session");

    // Redirigir
    window.location.href = "../index.html";
  });
}