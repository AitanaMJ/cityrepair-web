// perfil-tecnico.js
const API = "http://localhost:3000/api";

let todosResueltos = []; // todos los reportes resueltos del técnico

document.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem("cr_auth") || "null");
  if (!session || session.role !== "tecnico") {
    window.location.href = "./tecnico-login.html";
    return;
  }

  const nombre    = session.nombre || session.email.split("@")[0] || "Técnico";
  const correo    = session.email || "";
  const iniciales = nombre.trim().split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const setEl     = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

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

  // Stats + historial
  try {
    const res  = await fetch(`${API}/reportes/tecnico/${encodeURIComponent(correo)}`);
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      setEl("statAsignados", data.length);
      setEl("statRevision",  data.filter(r => (r.estado||"").toLowerCase().includes("rev")).length);
      setEl("statResueltos", data.filter(r => (r.estado||"").toLowerCase() === "resuelto").length);

      // Guardar TODOS los reportes para el historial (no solo resueltos)
      todosResueltos = data
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

      renderHistorial(todosResueltos);
    }
  } catch(e) {
    console.error(e);
    document.getElementById("historialResueltos").innerHTML =
      `<p style="color:#dc2626;text-align:center;padding:16px;font-size:0.87rem;">Error cargando historial.</p>`;
  }

  // Filtros
  document.getElementById("btnAplicarFiltros")?.addEventListener("click", aplicarFiltrosHistorial);
  document.getElementById("btnLimpiarFiltros")?.addEventListener("click", () => {
    document.getElementById("filtroTipo").value   = "";
    document.getElementById("filtroDesde").value  = "";
    document.getElementById("filtroHasta").value  = "";
    renderHistorial(todosResueltos);
  });

  // Cerrar sesión
  document.getElementById("btnLogoutPerfil")?.addEventListener("click", () => {
    localStorage.removeItem("cr_auth");
    window.location.href = "./login.html";
  });
});

function aplicarFiltrosHistorial() {
  const tipo   = document.getElementById("filtroTipo")?.value.toLowerCase()  || "";
  const estado = document.getElementById("filtroEstadoHist")?.value.toLowerCase() || "";
  const desde  = document.getElementById("filtroDesde")?.value || "";
  const hasta  = document.getElementById("filtroHasta")?.value || "";

  let filtrados = [...todosResueltos];

  if (tipo)   filtrados = filtrados.filter(r => (r.tipo||"").toLowerCase().includes(tipo));
  if (estado) filtrados = filtrados.filter(r => (r.estado||"").toLowerCase().includes(estado));
  if (desde)  filtrados = filtrados.filter(r => new Date(r.fecha) >= new Date(desde));
  if (hasta)  filtrados = filtrados.filter(r => new Date(r.fecha) <= new Date(hasta + "T23:59:59"));

  renderHistorial(filtrados);
}

function renderHistorial(reportes) {
  const contenedor = document.getElementById("historialResueltos");
  if (!contenedor) return;

  if (reportes.length === 0) {
    contenedor.innerHTML = `
      <div style="text-align:center;padding:32px 0;color:#9ca3af;">
        <div style="font-size:2.5rem;margin-bottom:10px;">📋</div>
        <p style="font-size:0.87rem;">No hay reportes resueltos que coincidan con los filtros.</p>
      </div>`;
    return;
  }

  // Íconos por tipo
  const typeIcons = {
    "corte": "⚡", "baja": "🔌", "transformador": "🔧",
    "luminaria": "💡", "cable": "🔗", "medidor": "⚙️", "poste": "🪝"
  };

  contenedor.innerHTML = reportes.map(r => {
    const fecha    = new Date(r.fecha).toLocaleDateString("es-AR", { day:"2-digit", month:"short", year:"numeric" });
    const fechaRes = r.fecha_resuelto
      ? new Date(r.fecha_resuelto).toLocaleDateString("es-AR", { day:"2-digit", month:"short", year:"numeric" })
      : "—";
    const tipoKey  = Object.keys(typeIcons).find(k => (r.tipo||"").toLowerCase().includes(k));
    const icon     = typeIcons[tipoKey] || "🛠️";
    const prioColor = r.prioridad === "alta" ? "#dc2626" :
                      r.prioridad === "media" ? "#d97706" : "#16a34a";
    const prioBg   = r.prioridad === "alta" ? "#fee2e2" :
                     r.prioridad === "media" ? "#fef3c7" : "#dcfce7";

    const estadoBadge = (() => {
      const e = (r.estado || "pendiente").toLowerCase();
      if (e === "resuelto")     return { bg: "#dcfce7", color: "#16a34a", icon: "✅", label: "Resuelto" };
      if (e.includes("rev"))    return { bg: "#fef3c7", color: "#92400e", icon: "🔄", label: "En revisión" };
      return { bg: "#dbeafe", color: "#003087", icon: "📋", label: "Pendiente" };
    })();

    return `
      <div style="
        display:flex; align-items:center; gap:14px;
        padding:14px; border-radius:12px; margin-bottom:10px;
        background:#f9fafb; border:1px solid #f0f0f0;
        transition:background .15s;">
        <div style="
          width:42px; height:42px; border-radius:10px;
          background:#dcfce7; display:flex; align-items:center;
          justify-content:center; font-size:1.3rem; flex-shrink:0;">
          ${icon}
        </div>
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px; flex-wrap:wrap;">
            <strong style="font-size:0.9rem; color:#111827; text-transform:capitalize;">${r.tipo || "Reporte"}</strong>
            <span style="font-size:0.7rem; color:#9ca3af;">#${r.id}</span>
            <span style="
              font-size:0.72rem; font-weight:700; padding:2px 8px;
              border-radius:999px; background:${prioBg}; color:${prioColor};">
              ${r.prioridad || "baja"}
            </span>
          </div>
          <p style="margin:0 0 5px; font-size:0.82rem; color:#4b5563; line-height:1.4;">
            ${r.descripcion || "Sin descripción"}
          </p>
          <div style="display:flex; gap:14px; flex-wrap:wrap; font-size:0.75rem; color:#9ca3af;">
            <span>📍 ${r.zona || "—"}</span>
            <span>📅 Reportado: ${fecha}</span>
            <span>✅ Resuelto: ${fechaRes}</span>
          </div>
        </div>
        <span style="
          flex-shrink:0; font-size:0.75rem; font-weight:700;
          padding:4px 10px; border-radius:999px;
          background:${estadoBadge.bg}; color:${estadoBadge.color};">
          ${estadoBadge.icon} ${estadoBadge.label}
        </span>
      </div>`;
  }).join("");
}