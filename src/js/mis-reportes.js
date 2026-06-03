const API = "http://localhost:3000/api";
const POR_PAGINA = 7;

const contenedor       = document.getElementById("lista-reportes");
const filtroEstado     = document.getElementById("filtro-estado");
const fechaDesdeEl     = document.getElementById("fecha-desde");
const fechaHastaEl     = document.getElementById("fecha-hasta");
const btnAplicarFecha  = document.getElementById("btn-aplicar-fecha");
const btnLimpiarFecha  = document.getElementById("btn-limpiar-fecha");
const paginadoEl       = document.getElementById("paginado-mis-reportes");

let reportesUsuario = [];
let reportesFiltrados = [];
let paginaActual = 1;

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
    // Ocultar resueltos — van al buzón de notificaciones del perfil
    reportesUsuario = data
      .filter(r => (r.estado || "").toLowerCase() !== "resuelto")
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    aplicarFiltros();
  } catch (err) {
    console.error("Error:", err);
    contenedor.innerHTML = `<p class="error-msg">Error cargando reportes</p>`;
  }
}

/* =========================
   APLICAR FILTROS
========================= */
function aplicarFiltros() {
  const estado = filtroEstado?.value || "todos";
  const desde  = fechaDesdeEl?.value || "";
  const hasta  = fechaHastaEl?.value || "";

  let lista = [...reportesUsuario];

  if (estado !== "todos") {
    lista = lista.filter(r => {
      const est = (r.estado || "pendiente").toLowerCase();
      if (estado === "en revision") return est.includes("rev");
      return est === estado;
    });
  }

  if (desde) lista = lista.filter(r => new Date(r.fecha) >= new Date(desde));
  if (hasta) lista = lista.filter(r => new Date(r.fecha) <= new Date(hasta));

  reportesFiltrados = lista;
  paginaActual = 1;
  actualizarPills();
  renderPagina();
}

/* =========================
   PILLS
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
   PAGINADO
========================= */
function renderPagina() {
  const total  = reportesFiltrados.length;
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const fin    = inicio + POR_PAGINA;
  renderReportes(reportesFiltrados.slice(inicio, fin));
  renderPaginado(total);
}

function renderPaginado(total) {
  if (!paginadoEl) return;
  const totalPaginas = Math.ceil(total / POR_PAGINA);
  if (totalPaginas <= 1) { paginadoEl.innerHTML = ""; return; }

  let html = `<button class="prev-next" onclick="irPagina(${paginaActual - 1})" ${paginaActual === 1 ? "disabled" : ""}>← Anterior</button>`;

  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= paginaActual - 2 && i <= paginaActual + 2)) {
      html += `<button class="${i === paginaActual ? "activa" : ""}" onclick="irPagina(${i})">${i}</button>`;
    } else if (i === paginaActual - 3 || i === paginaActual + 3) {
      html += `<button disabled>...</button>`;
    }
  }

  html += `<button class="prev-next" onclick="irPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? "disabled" : ""}>Siguiente →</button>`;
  paginadoEl.innerHTML = html;
}

function irPagina(n) {
  const totalPaginas = Math.ceil(reportesFiltrados.length / POR_PAGINA);
  if (n < 1 || n > totalPaginas) return;
  paginaActual = n;
  renderPagina();
  contenedor.scrollIntoView({ behavior: "smooth" });
}
window.irPagina = irPagina;

/* =========================
   RENDER REPORTES
========================= */
function renderReportes(lista) {
  contenedor.innerHTML = "";

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
      : estado.includes("rev") ? "en-proceso" : "pendiente";

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
   EDITAR / ELIMINAR
========================= */
function editarReporte(id) {
  window.location.href = `./editar-reporte.html?id=${id}`;
}

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
filtroEstado?.addEventListener("change", aplicarFiltros);
btnAplicarFecha?.addEventListener("click", aplicarFiltros);
btnLimpiarFecha?.addEventListener("click", () => {
  if (fechaDesdeEl) fechaDesdeEl.value = "";
  if (fechaHastaEl) fechaHastaEl.value = "";
  aplicarFiltros();
});

window.editarReporte   = editarReporte;
window.eliminarReporte = eliminarReporte;