// perfil-admin.js — Perfil del administrador con stats dinámicos

import { API } from "./api.js";

document.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem("cr_auth") || "null");

  if (!session || session.role !== "admin") {
    window.location.href = "./login.html";
    return;
  }

  const email    = session.email || "admin@edet.com";
  const nombre   = session.nombre || email.split("@")[0] || "Admin";
  const iniciales = nombre.trim().split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

  // Helpers
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  // Datos básicos
  setEl("perfilNombre", nombre);
  setEl("perfilEmail",  email);
  setEl("infoNombre",   nombre);
  setEl("infoEmail",    email);
  setEl("infoUid",      session.id || session.uid || "local-user");

  const avatarEl = document.getElementById("perfilAvatar");
  if (avatarEl) avatarEl.textContent = iniciales;

  // Stats desde backend
  try {
    const res  = await fetch(`${API}/reportes`);
    const data = await res.json();

    if (res.ok && Array.isArray(data)) {
      const total      = data.length;
      const pendientes = data.filter(r => (r.estado || "").toLowerCase() === "pendiente").length;
      const revision   = data.filter(r => (r.estado || "").toLowerCase().includes("rev")).length;
      const resueltos  = data.filter(r => (r.estado || "").toLowerCase() === "resuelto").length;

      setEl("statTotal",      total);
      setEl("statPendientes", pendientes);
      setEl("statRevision",   revision);
      setEl("statResueltos",  resueltos);
    }
  } catch (_) {
    ["statTotal", "statPendientes", "statRevision", "statResueltos"]
      .forEach(id => setEl(id, "—"));
  }

  // Cerrar sesión
  const logout = () => {
    localStorage.removeItem("cr_auth");
    window.location.href = "./login.html";
  };
  document.getElementById("btnLogoutPerfil")?.addEventListener("click", logout);
  document.getElementById("btnLogoutNav")?.addEventListener("click", logout);
});