// perfil.js — Perfil del ciudadano

const API = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem("cr_auth") || "null");

  if (!session || session.role !== "citizen") {
    window.location.href = "./login.html";
    return;
  }

  const email    = session.email || "";
  const nombre   = session.nombre || email.split("@")[0] || "Usuario";
  const iniciales = nombre.trim().split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  // Datos básicos
  setEl("nombrePerfil",     nombre);
  setEl("emailPerfil",      email);
  setEl("infoNombre",       nombre);
  setEl("infoEmail",        email);
  setEl("perfilUID",        session.id || "local-user");
  setEl("perfilUltimoLogin", new Date().toLocaleString("es-AR"));

  const avatarEl = document.getElementById("perfilAvatar");
  if (avatarEl) {
    if (session.photoURL) {
      avatarEl.style.backgroundImage = `url(${session.photoURL})`;
      avatarEl.style.backgroundSize  = "cover";
      avatarEl.textContent = "";
    } else {
      avatarEl.textContent = iniciales;
    }
  }

  // Stats desde backend
  try {
    const res  = await fetch(`${API}/mis-reportes/${session.id}`);
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      setEl("perfilTotalReportes", data.length);
      setEl("perfilPendientes",    data.filter(r => (r.estado||"").toLowerCase() === "pendiente").length);
      setEl("perfilResueltos",     data.filter(r => (r.estado||"").toLowerCase() === "resuelto").length);
    }
  } catch(e) { console.error(e); }

  // Cambiar foto
  const btnFoto  = document.getElementById("btnCambiarFoto");
  const inputFoto = document.getElementById("inputFoto");
  btnFoto?.addEventListener("click", () => inputFoto.click());
  inputFoto?.addEventListener("change", (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      session.photoURL = base64;
      localStorage.setItem("cr_auth", JSON.stringify(session));
      if (avatarEl) {
        avatarEl.style.backgroundImage = `url(${base64})`;
        avatarEl.style.backgroundSize  = "cover";
        avatarEl.textContent = "";
      }
      alert("✅ Foto actualizada correctamente.");
    };
    reader.readAsDataURL(archivo);
  });

  // Cerrar sesión
  document.getElementById("btnLogout")?.addEventListener("click", () => {
    localStorage.removeItem("cr_auth");
    window.location.href = "./login.html";
  });

  // Dar de baja
  document.getElementById("btnDarBaja")?.addEventListener("click", async () => {
    if (!session.id) { alert("No se encontró tu ID de usuario."); return; }
    const ok = confirm("¿Seguro que querés dar de baja tu cuenta?\nNo podrás iniciar sesión hasta contactar al soporte.");
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