const API = "http://localhost:3000/api";

const contenedor = document.getElementById("lista-reportes");
const filtroEstadoSelect = document.getElementById("filtro-estado");

let reportesUsuario = [];

/* =========================
   CARGAR REPORTES
========================= */
async function cargarReportes() {
  try {
    const session = JSON.parse(localStorage.getItem("cr_auth"));
    if (!session) { window.location.href = "./login.html"; return; }

    const res = await fetch(`${API}/mis-reportes/${session.id}`);
    if (!res.ok) throw new Error("Error obteniendo reportes");

    const data = await res.json();
    reportesUsuario = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    renderReportes();
  } catch (err) {
    console.error("Error:", err);
    contenedor.innerHTML = `<p class="error-msg">Error cargando reportes</p>`;
  }
}

/* =========================
   ACTUALIZAR PILLS
========================= */
function actualizarPills() {
  const elPendiente = document.getElementById("resumen-pendiente");
  const elRevision  = document.getElementById("resumen-enproceso");
  const elResuelto  = document.getElementById("resumen-resuelto");

  if (elPendiente) elPendiente.textContent = "Pendientes: "  + reportesUsuario.filter(r => (r.estado || "pendiente") === "pendiente").length;
  if (elRevision)  elRevision.textContent  = "En revisión: " + reportesUsuario.filter(r => (r.estado || "").toLowerCase().includes("rev")).length;
  if (elResuelto)  elResuelto.textContent  = "Resueltos: "   + reportesUsuario.filter(r => r.estado === "resuelto").length;
}

/* =========================
   RENDER REPORTES
========================= */
function renderReportes(filtro = "todos") {
  contenedor.innerHTML = "";

  actualizarPills();

  let lista = reportesUsuario;

  if (filtro !== "todos") {
    lista = lista.filter(r => {
      const est = (r.estado || "pendiente").toLowerCase();
      if (filtro === "en revision") return est.includes("rev");
      return est === filtro;
    });
  }

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="empty-msg">No hay reportes</p>`;
    return;
  }

  const iconos = {
    "corte-total": "⚡", "corte-parcial": "🔌",
    "cable-caido": "🪛", "medidor-quemado": "🔥",
    "baja-tension": "📉", "poste-danado": "🏚️",
    "luminaria-publica": "💡", "transformador-riesgo": "⚠️"
  };

  lista.forEach(reporte => {
    const estado    = (reporte.estado || "pendiente").toLowerCase();
    const prioridad = (reporte.prioridad || "baja").toLowerCase();
    const icono     = iconos[reporte.tipo] || "📋";
    const fecha     = new Date(reporte.fecha).toLocaleDateString("es-AR", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    const estadoClass = estado === "resuelto" ? "resuelto"
      : estado.includes("rev") ? "en-proceso"
      : "pendiente";

    const div = document.createElement("div");
    div.className = "reporte-card";
    div.dataset.estado = estado;

    div.innerHTML = `
      <div class="reporte-header">
        <div class="reporte-tipo">
          <span class="reporte-icono">${icono}</span>
          ${reporte.tipo}
        </div>
        <span class="reporte-estado ${estadoClass}">${estado}</span>
      </div>

      <p class="reporte-descripcion">${reporte.descripcion}</p>

      <div class="reporte-meta">
        <span>📍 ${reporte.ubicacion}</span>
        <span>🏘️ ${reporte.zona || "—"}</span>
        <span>🕐 ${fecha}</span>
        <span class="reporte-prioridad prioridad-${prioridad}">🚨 ${prioridad}</span>
      </div>

      ${estado === "pendiente" ? `
        <div class="report-actions">
          <button class="btn-edit" onclick="editarReporte(${reporte.id})">✏️ Editar</button>
          <button class="btn-delete" onclick="eliminarReporte(${reporte.id})">🗑️ Eliminar</button>
        </div>
      ` : ""}
    `;

    contenedor.appendChild(div);
  });
}

/* =========================
   EDITAR REPORTE
========================= */
function editarReporte(id) {
  window.location.href = `./editar-reporte.html?id=${id}`;
}

/* =========================
   ELIMINAR REPORTE
========================= */
async function eliminarReporte(id) {
  if (!confirm("¿Eliminar este reporte?")) return;
  try {
    const res = await fetch(`${API}/reportes/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Error eliminando");
    cargarReportes();
  } catch (err) {
    alert("Error eliminando reporte");
  }
}

/* =========================
   EVENTOS
========================= */
document.addEventListener("DOMContentLoaded", cargarReportes);

filtroEstadoSelect?.addEventListener("change", (e) => {
  renderReportes(e.target.value);
});

window.editarReporte   = editarReporte;
window.eliminarReporte = eliminarReporte;