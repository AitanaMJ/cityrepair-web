// perfil-admin.js
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
  setEl("infoUid",      session.id || "local-user");
  const avatarEl = document.getElementById("perfilAvatar");
  if (avatarEl) avatarEl.textContent = iniciales;

  // Stats
  try {
    const res  = await fetch(`${API}/reportes`);
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      setEl("statTotal",      data.length);
      setEl("statPendientes", data.filter(r => (r.estado||"").toLowerCase() === "pendiente").length);
      setEl("statRevision",   data.filter(r => (r.estado||"").toLowerCase().includes("rev")).length);
      setEl("statResueltos",  data.filter(r => (r.estado||"").toLowerCase() === "resuelto").length);
    }
  } catch(e) { console.error(e); }

  // Mensajes de técnicos
  await cargarMensajesTecnicos();

  // Cargar técnicos
  await cargarTecnicos();

  // Cerrar sesión
  const logout = () => { localStorage.removeItem("cr_auth"); window.location.href = "./login.html"; };
  document.getElementById("btnLogoutPerfil")?.addEventListener("click", logout);
  document.getElementById("btnLogoutNav")?.addEventListener("click", logout);

  // Dar de baja cuenta admin
  document.getElementById("btnDarBaja")?.addEventListener("click", () => darDeBaja(session.id, true));
});

async function cargarTecnicos() {
  const contenedor = document.getElementById("listaTecnicos");
  if (!contenedor) return;

  try {
    const res  = await fetch(`${API}/tecnicos/todos`);
    const data = await res.json();

    if (!res.ok || !Array.isArray(data) || data.length === 0) {
      contenedor.innerHTML = `<p class="admin-loading-txt">No hay técnicos registrados.</p>`;
      return;
    }

    contenedor.innerHTML = data.map(t => {
      const activo = t.activo !== 0;
      return `
        <div class="tec-row" id="tec-row-${t.id}">
          <div class="tec-row-info">
            <div class="tec-row-avatar">${t.email[0].toUpperCase()}</div>
            <div>
              <p class="tec-row-email">${t.email}</p>
              <span class="tec-row-badge ${activo ? "badge-activo" : "badge-inactivo"}">
                ${activo ? "✅ Activo" : "🚫 Desactivado"}
              </span>
            </div>
          </div>
          <button
            class="tec-row-btn ${activo ? "btn-desactivar" : "btn-reactivar"}"
            onclick="toggleTecnico(${t.id}, ${activo ? 0 : 1}, '${t.email}')">
            ${activo ? "Dar de baja" : "Reactivar"}
          </button>
        </div>`;
    }).join("");
  } catch(e) {
    contenedor.innerHTML = `<p class="admin-loading-txt" style="color:#dc2626">Error cargando técnicos.</p>`;
  }
}

window.toggleTecnico = async function(id, nuevoEstado, email) {
  const accion = nuevoEstado === 0 ? "desactivar" : "reactivar";
  if (!confirm(`¿Estás seguro que querés ${accion} la cuenta de ${email}?`)) return;

  try {
    const res = await fetch(`${API}/usuarios/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: nuevoEstado })
    });
    if (!res.ok) throw new Error();
    await cargarTecnicos(); // refrescar lista
    alert(`✅ Cuenta ${nuevoEstado === 0 ? "desactivada" : "reactivada"} correctamente.`);
  } catch {
    alert("❌ Error al actualizar la cuenta.");
  }
};

async function darDeBaja(userId, esAdmin) {
  const confirm1 = confirm("¿Estás seguro que querés dar de baja tu propia cuenta?\nNo podrás iniciar sesión hasta que otro administrador la reactive.");
  if (!confirm1) return;

  try {
    const res = await fetch(`${API}/usuarios/${userId}/estado`, {
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
}

async function cargarMensajesTecnicos() {
  const contenedor = document.getElementById("listaMensajesTec");
  const badge      = document.getElementById("badgeMensajes");
  if (!contenedor) return;

  try {
    const res  = await fetch(`${API}/mensajes-admin`);
    const data = await res.json();

    if (!res.ok || !Array.isArray(data) || data.length === 0) {
      contenedor.innerHTML = `<p class="admin-loading-txt">No hay mensajes de técnicos todavía.</p>`;
      return;
    }

    const noLeidos = data.filter(m => !m.leido).length;
    if (noLeidos > 0 && badge) {
      badge.textContent = noLeidos;
      badge.style.display = "inline-block";
    }

    contenedor.innerHTML = data.map(m => {
      const fecha   = new Date(m.fecha).toLocaleString("es-AR", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
      const esRes   = m.tipo === "resolucion";
      const bgCard  = m.leido ? "#f9fafb" : (esRes ? "#f0fdf4" : "#fffbeb");
      const border  = m.leido ? "#f0f0f0" : (esRes ? "#bbf7d0" : "#fde68a");
      const icon    = esRes ? "✅" : "🔄";
      const label   = esRes ? "Resolución" : "En revisión";
      const labelBg = esRes ? "#dcfce7" : "#fef3c7";
      const labelCo = esRes ? "#166534" : "#92400e";

      return `
        <div id="msg-${m.id}" style="
          padding:14px; border-radius:12px; margin-bottom:10px;
          background:${bgCard}; border:1px solid ${border};">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:8px;flex-wrap:wrap;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <span style="font-size:1.1rem;">${icon}</span>
              <span style="font-size:0.78rem;font-weight:700;padding:2px 10px;border-radius:999px;background:${labelBg};color:${labelCo};">${label}</span>
              <span style="font-size:0.78rem;color:#9ca3af;">Reporte #${m.reporte_id} — ${m.reporte_tipo || ""}</span>
              ${esRes && m.horas ? `<span style="font-size:0.75rem;font-weight:700;color:#16a34a;">⏱ ${m.horas}h</span>` : ""}
            </div>
            <span style="font-size:0.72rem;color:#9ca3af;white-space:nowrap;">${fecha}</span>
          </div>
          <p style="margin:0 0 8px;font-size:0.85rem;color:#374151;line-height:1.5;">
            <strong style="color:#003087;">@${m.tecnico_email?.split("@")[0]}:</strong> ${m.mensaje}
          </p>
          ${!m.leido ? `<button onclick="marcarMensajeLeido(${m.id})"
            style="font-size:0.76rem;color:#003087;background:none;border:none;cursor:pointer;font-family:'DM Sans',sans-serif;font-weight:600;padding:0;">
            ✓ Marcar como leído
          </button>` : `<span style="font-size:0.74rem;color:#9ca3af;">✓ Leído</span>`}
        </div>`;
    }).join("");
  } catch(e) {
    if (contenedor) contenedor.innerHTML = `<p class="admin-loading-txt" style="color:#dc2626">Error cargando mensajes.</p>`;
  }
}

window.marcarMensajeLeido = async function(id) {
  try {
    await fetch(`${API}/mensajes-admin/${id}/leer`, { method: "PUT" });
    const el = document.getElementById(`msg-${id}`);
    if (el) {
      el.style.background = "#f9fafb";
      el.style.borderColor = "#f0f0f0";
      const btn = el.querySelector("button");
      if (btn) btn.replaceWith(Object.assign(document.createElement("span"), {
        style: "font-size:0.74rem;color:#9ca3af;",
        textContent: "✓ Leído"
      }));
    }
    const badge = document.getElementById("badgeMensajes");
    if (badge) {
      const actual = parseInt(badge.textContent) - 1;
      if (actual <= 0) badge.style.display = "none";
      else badge.textContent = actual;
    }
  } catch(e) { console.error(e); }
};