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

  // Buzón de notificaciones
  await cargarBuzon(session.id);

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

async function cargarBuzon(usuarioId) {
  const contenedor = document.getElementById("listaBuzon");
  const badge      = document.getElementById("badgeNoLeidas");
  if (!contenedor) return;

  try {
    const res  = await fetch(`${API}/notificaciones/${usuarioId}`);
    const data = await res.json();

    if (!res.ok || !Array.isArray(data) || data.length === 0) {
      contenedor.innerHTML = `
        <div style="text-align:center; padding:24px 0; color:#9ca3af;">
          <div style="font-size:2rem; margin-bottom:8px;">📭</div>
          <p style="font-size:0.87rem;">No tenés notificaciones todavía.</p>
        </div>`;
      return;
    }

    const noLeidas = data.filter(n => !n.leida).length;
    if (noLeidas > 0) {
      badge.textContent = noLeidas;
      badge.style.display = "inline-block";
    }

    contenedor.innerHTML = data.map(n => {
      const fecha  = new Date(n.fecha).toLocaleString("es-AR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
      const leida  = n.leida;
      return `
        <div id="notif-${n.id}" style="
          display:flex; gap:14px; align-items:flex-start;
          padding:14px; border-radius:12px; margin-bottom:10px;
          background:${leida ? "#f9fafb" : "#eff6ff"};
          border:1px solid ${leida ? "#f0f0f0" : "#bfdbfe"};
          transition:background 0.2s;">
          <div style="font-size:1.4rem; flex-shrink:0;">${leida ? "📬" : "📩"}</div>
          <div style="flex:1; min-width:0;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-size:0.78rem; font-weight:700; color:#1d4ed8;">
                Reporte #${n.reporte_id} — ${n.reporte_tipo || ""}
              </span>
              <span style="font-size:0.72rem; color:#9ca3af;">${fecha}</span>
            </div>
            <p style="margin:0 0 8px; font-size:0.87rem; color:#374151; line-height:1.5;">${n.mensaje}</p>
            ${!leida ? `<button onclick="marcarLeida(${n.id})"
              style="font-size:0.78rem; color:#1d4ed8; background:none; border:none;
                     cursor:pointer; font-family:'DM Sans',sans-serif; font-weight:600; padding:0;">
              ✓ Marcar como leída
            </button>` : `<span style="font-size:0.75rem; color:#9ca3af;">✓ Leída</span>`}
          </div>
        </div>`;
    }).join("");
  } catch(e) {
    contenedor.innerHTML = `<p style="color:#dc2626; font-size:0.87rem;">Error cargando notificaciones.</p>`;
  }
}

window.marcarLeida = async function(id) {
  try {
    await fetch(`${API}/notificaciones/${id}/leer`, { method: "PUT" });
    const el = document.getElementById(`notif-${id}`);
    if (el) {
      el.style.background = "#f9fafb";
      el.style.borderColor = "#f0f0f0";
      el.querySelector("button")?.replaceWith(Object.assign(document.createElement("span"), {
        style: "font-size:0.75rem; color:#9ca3af;",
        textContent: "✓ Leída"
      }));
      el.querySelector("div")?.childNodes[0]?.replaceWith(
        Object.assign(document.createTextNode(""), { textContent: "📬" })
      );
    }
    // Actualizar badge
    const badge = document.getElementById("badgeNoLeidas");
    if (badge) {
      const actual = parseInt(badge.textContent) - 1;
      if (actual <= 0) badge.style.display = "none";
      else badge.textContent = actual;
    }
  } catch(e) { console.error(e); }
};