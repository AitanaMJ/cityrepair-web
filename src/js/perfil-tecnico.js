// perfil-tecnico.js — Perfil del técnico con stats dinámicos

import { API } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const sessionRaw = localStorage.getItem("cr_auth");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;

  if (!session || session.role !== "tecnico") {
    window.location.href = "./tecnico-login.html";
    return;
  }

  const nombre = session.nombre || session.email.split("@")[0] || "Técnico";
  const correo = session.email || "";
  const iniciales = nombre.trim().split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

  // --- Pintar datos básicos ---
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setEl("perfilNombre",  nombre);
  setEl("perfilEmail",   correo);
  setEl("infoNombre",    nombre);
  setEl("infoEmail",     correo);
  setEl("infoUid",       session.id || session.uid || "local-user");

  const avatarEl = document.getElementById("perfilAvatar");
  if (avatarEl) avatarEl.textContent = iniciales;

  // Navbar
  const navAvatar = document.querySelector("[data-user-avatar]");
  const navName   = document.querySelector("[data-user-name]");
  if (navAvatar) navAvatar.textContent = iniciales;
  if (navName)   navName.textContent   = nombre;

  // --- Stats desde backend ---
  try {
    const res  = await fetch(`${API}/reportes/tecnico/${encodeURIComponent(correo)}`);
    const data = await res.json();

    if (res.ok && Array.isArray(data)) {
      const total     = data.length;
      const revision  = data.filter(r => (r.estado || "").toLowerCase().includes("rev")).length;
      const resueltos = data.filter(r => (r.estado || "").toLowerCase() === "resuelto").length;

      setEl("statAsignados",  total);
      setEl("statRevision",   revision);
      setEl("statResueltos",  resueltos);
    }
  } catch (_) {
    ["statAsignados", "statRevision", "statResueltos"].forEach(id => setEl(id, "—"));
  }

  // --- Botón cerrar sesión del perfil ---
  document.getElementById("btnLogoutPerfil")?.addEventListener("click", () => {
    localStorage.removeItem("cr_auth");
    window.location.href = "./login.html";
  });
});