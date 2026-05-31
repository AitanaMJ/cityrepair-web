// perfil-admin.js — Perfil del administrador con stats dinámicos

const API = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem("cr_auth") || "null");

  if (!session || session.role !== "admin") {
    window.location.href = "./login.html";
    return;
  }

  const email    = session.email || "admin@edet.com";
  const nombre   = session.nombre || email.split("@")[0] || "Admin";
  const iniciales = nombre.trim().split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

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
      setEl("statTotal",      data.length);
      setEl("statPendientes", data.filter(r => (r.estado || "").toLowerCase() === "pendiente").length);
      setEl("statRevision",   data.filter(r => (r.estado || "").toLowerCase().includes("rev")).length);
      setEl("statResueltos",  data.filter(r => (r.estado || "").toLowerCase() === "resuelto").length);
    }
  } catch (e) {
    console.error("Error cargando stats:", e);
  }

  const logout = () => {
    localStorage.removeItem("cr_auth");
    window.location.href = "./login.html";
  };
  document.getElementById("btnLogoutPerfil")?.addEventListener("click", logout);
  document.getElementById("btnLogoutNav")?.addEventListener("click", logout);
});