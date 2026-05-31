// perfil-tecnico.js — Perfil del técnico con stats dinámicos

const API = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", async () => {
  const sessionRaw = localStorage.getItem("cr_auth");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;

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
  setEl("infoUid",      session.id || session.uid || "local-user");

  const avatarEl = document.getElementById("perfilAvatar");
  if (avatarEl) avatarEl.textContent = iniciales;

  const navAvatar = document.querySelector("[data-user-avatar]");
  const navName   = document.querySelector("[data-user-name]");
  if (navAvatar) navAvatar.textContent = iniciales;
  if (navName)   navName.textContent   = nombre;

  // Stats desde backend
  try {
    const res  = await fetch(`${API}/reportes/tecnico/${encodeURIComponent(correo)}`);
    const data = await res.json();

    if (res.ok && Array.isArray(data)) {
      setEl("statAsignados", data.length);
      setEl("statRevision",  data.filter(r => (r.estado || "").toLowerCase().includes("rev")).length);
      setEl("statResueltos", data.filter(r => (r.estado || "").toLowerCase() === "resuelto").length);
    }
  } catch (e) {
    console.error("Error cargando stats:", e);
  }

  document.getElementById("btnLogoutPerfil")?.addEventListener("click", () => {
    localStorage.removeItem("cr_auth");
    window.location.href = "./login.html";
  });
});