document.addEventListener("DOMContentLoaded", () => {
  const userMenuBtn = document.getElementById("userMenuBtn");
  const userDropdown = document.getElementById("userDropdown");
  const logoutFromMenu = document.getElementById("logoutFromMenu");

  if (!userMenuBtn || !userDropdown) return;

  // abrir/cerrar menú
  userMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    userDropdown.hidden = !userDropdown.hidden;
  });

  // cerrar si clic afuera
  document.addEventListener("click", () => {
    userDropdown.hidden = true;
  });

  // cerrar sesión desde el menú
  if (logoutFromMenu) {
    logoutFromMenu.addEventListener("click", async (e) => {
      e.preventDefault();
      // usamos tu mismo logout de firebase
      const { signOut } = await import("https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js");
      const { auth } = await import("./firebase.js");
      await signOut(auth);
      window.location.href = "/pages/login.html";
    });
  }
});