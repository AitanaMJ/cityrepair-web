// perfil-tecnico.js
const API = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem("cr_auth") || "null");
  if (!session || session.role !== "tecnico") {
    window.location.href = "./tecnico-login.html";
    return;
  }

  const nombre   = session.nombre || session.email.split("@")[0] || "Técnico";
  const correo   = session.email || "";
  const iniciales = nombre.trim().split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setEl("perfilNombre", nombre);
  setEl("perfilEmail",  correo);
  setEl("infoNombre",   nombre);
  setEl("infoEmail",    correo);
  setEl("infoUid",      session.id || "local-user");

  const avatarEl = document.getElementById("perfilAvatar");
  if (avatarEl) avatarEl.textContent = iniciales;

  const navAvatar = document.querySelector("[data-user-avatar]");
  const navName   = document.querySelector("[data-user-name]");
  if (navAvatar) navAvatar.textContent = iniciales;
  if (navName)   navName.textContent   = nombre;

  // Stats
  try {
    const res  = await fetch(`${API}/reportes/tecnico/${encodeURIComponent(correo)}`);
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      setEl("statAsignados", data.length);
      setEl("statRevision",  data.filter(r => (r.estado||"").toLowerCase().includes("rev")).length);
      setEl("statResueltos", data.filter(r => (r.estado||"").toLowerCase() === "resuelto").length);
    }
  } catch(e) { console.error(e); }

  // Cerrar sesión
  document.getElementById("btnLogoutPerfil")?.addEventListener("click", () => {
    localStorage.removeItem("cr_auth");
    window.location.href = "./login.html";
  });

  // Dar de baja propia cuenta
  document.getElementById("btnDarBaja")?.addEventListener("click", async () => {
    if (!session.id) { alert("No se encontró tu ID de usuario."); return; }

    const ok = confirm("¿Seguro que querés dar de baja tu cuenta?\nNo podrás iniciar sesión hasta que un administrador la reactive.");
    if (!ok) return;

    try {
      const res = await fetch(`${API}/usuarios/${session.id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: 0 })
      });
      if (!res.ok) throw new Error();
      alert("Tu cuenta ha sido desactivada.");
      localStorage.removeItem("cr_auth");
      window.location.href = "./login.html";
    } catch {
      alert("❌ Error al dar de baja la cuenta.");
    }
  });
});