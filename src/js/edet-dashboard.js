//edet-dashboard.js
/* =======================================================
   ELEMENTOS
======================================================= */

const API = "http://localhost:3000/api";

const contenedor = document.getElementById("edet-reportes-container");

const kpiTotal = document.getElementById("kpiTotal");
const kpiOk = document.getElementById("kpiOk");
const kpiReview = document.getElementById("kpiReview");
const kpiHigh = document.getElementById("kpiHigh");

const filtroResolucion = document.getElementById("filtroResolucion");
const fechaDesde = document.getElementById("fechaDesde");
const fechaHasta = document.getElementById("fechaHasta");
const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");

const ctxEstado = document.getElementById("chartStatus");
const ctxZona = document.getElementById("chartZones");

let REPORTES_ORIGINALES = [];
let CHART_ESTADOS = null;
let CHART_ZONA = null;

/* =======================================================
   CARGAR DESDE BACKEND
======================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`${API}/reportes`);
    const data = await res.json();

    REPORTES_ORIGINALES = data.map(r => ({
      ...r,
      fecha: new Date(r.fecha)
    }));

    aplicarFiltros();
  } catch (err) {
    console.error("Error cargando reportes:", err);
    contenedor.innerHTML = "<p class='empty-state'>Error cargando reportes</p>";
  }
});

/* =======================================================
   CAMBIAR ESTADO DESDE EL DASHBOARD
======================================================= */

async function cambiarEstado(id, nuevoEstado) {
  try {
    const res = await fetch(`${API}/reportes/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado })
    });

    if (!res.ok) throw new Error("Error actualizando estado");

    // Actualizar localmente sin recargar todo
    const reporte = REPORTES_ORIGINALES.find(r => r.id == id);
    if (reporte) reporte.estado = nuevoEstado;

    aplicarFiltros();
  } catch (err) {
    alert("Error al cambiar el estado");
  }
}

window.cambiarEstado = cambiarEstado;

/* =======================================================
   FILTROS
======================================================= */

function aplicarFiltros() {

  let filtrados = [...REPORTES_ORIGINALES];

  const resolucion = filtroResolucion.value;
  const desde = fechaDesde.value;
  const hasta = fechaHasta.value;

  if (resolucion === "resuelto") {
    filtrados = filtrados.filter(r => r.estado === "resuelto");
  }

  if (resolucion === "no_resuelto") {
    filtrados = filtrados.filter(r => r.estado !== "resuelto");
  }

  if (desde) {
    const fDesde = new Date(desde);
    filtrados = filtrados.filter(r => new Date(r.fecha) >= fDesde);
  }

  if (hasta) {
    const fHasta = new Date(hasta);
    filtrados = filtrados.filter(r => new Date(r.fecha) <= fHasta);
  }

  renderTabla(filtrados);
  actualizarKPIs(filtrados);
  actualizarCharts(filtrados);
}

btnAplicarFiltros.addEventListener("click", aplicarFiltros);

/* =======================================================
   LISTADO DE REPORTES
======================================================= */

function renderTabla(reportes) {
  REPORTES_FILTRADOS = reportes;

  if (!reportes.length) {
    contenedor.innerHTML =
      "<p class='empty-state'>No hay reportes disponibles</p>";
    return;
  }

  contenedor.innerHTML = `
    <div class="reportes-wrapper">
      ${reportes.map(r => {

        const fecha = new Date(r.fecha).toLocaleDateString("es-AR");
        const estado = (r.estado || "pendiente").toLowerCase();

        const estadoClass =
          estado === "resuelto"
            ? "estado-ok"
            : estado.includes("rev")
              ? "estado-review"
              : "estado-pendiente";

        const prioridad = (r.prioridad || "media").toLowerCase();

        const prioridadClass =
          prioridad === "alta"
            ? "prioridad-alta"
            : prioridad === "media"
              ? "prioridad-media"
              : "prioridad-baja";

        const idCorto = String(r.id).slice(0, 6);

        return `
          <div class="reporte-card ${estadoClass}">
            <div class="reporte-header">
              <span class="reporte-id">#${idCorto}</span>
              <span class="badge ${prioridadClass}">${prioridad}</span>
            </div>

            <div class="reporte-body">
              <h4>${r.tipo || "Sin categoría"}</h4>
              <p class="estado-label">${estado}</p>
              <p class="fecha-label">${fecha}</p>
              ${r.descripcion ? `<p class="desc-label">${r.descripcion}</p>` : ""}
            </div>

            <div class="reporte-acciones">
              <select onchange="cambiarEstado(${r.id}, this.value)">
                <option value="pendiente" ${estado === "pendiente" ? "selected" : ""}>Pendiente</option>
                <option value="en revision" ${estado === "en revision" ? "selected" : ""}>En revisión</option>
                <option value="resuelto" ${estado === "resuelto" ? "selected" : ""}>Resuelto</option>
              </select>
            </div>
          </div>
        `;

      }).join("")}
    </div>
  `;
}

/* =======================================================
   KPIs
======================================================= */

function actualizarKPIs(reportes) {
  kpiTotal.textContent = reportes.length;
  kpiOk.textContent = reportes.filter(r => r.estado === "resuelto").length;
  kpiReview.textContent = reportes.filter(r => r.estado?.includes("rev")).length;
  kpiHigh.textContent = reportes.filter(r => r.prioridad === "alta").length;
}

/* =======================================================
   CHARTS
======================================================= */

function actualizarCharts(reportes) {

  const estados = { pendiente:0, revision:0, resuelto:0 };
  const zonas = {};

  reportes.forEach(r => {
    const est = (r.estado || "pendiente").toLowerCase();
    if (est === "resuelto") estados.resuelto++;
    else if (est.includes("rev")) estados.revision++;
    else estados.pendiente++;

    let zona = r.zona || "Sin zona";
    zonas[zona] = (zonas[zona] || 0) + 1;
  });

  if (CHART_ESTADOS) CHART_ESTADOS.destroy();
  if (CHART_ZONA) CHART_ZONA.destroy();

  CHART_ESTADOS = new Chart(ctxEstado, {
    type: "doughnut",
    data: {
      labels: ["Pendiente","En revisión","Resuelto"],
      datasets: [{
        data: [estados.pendiente, estados.revision, estados.resuelto],
        backgroundColor: ["#3b82f6","#ec4899","#f97316"]
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  CHART_ZONA = new Chart(ctxZona, {
    type: "bar",
    data: {
      labels: Object.keys(zonas),
      datasets: [{
        label: "Reportes",
        data: Object.values(zonas),
        backgroundColor: "#3b82f6"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { x: { ticks: { maxRotation: 0, autoSkip: true } } }
    }
  });
}

/* =======================================================
   EXPORTAR PDF
======================================================= */

// Guardamos los reportes actualmente filtrados
let REPORTES_FILTRADOS = [];

document.getElementById("btnExportarPDF")
.addEventListener("click", () => {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const reportes = REPORTES_FILTRADOS.length
    ? REPORTES_FILTRADOS
    : REPORTES_ORIGINALES;

  // ── Encabezado ──────────────────────────────────────
  doc.setFillColor(13, 110, 253);
  doc.rect(0, 0, pageW, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CityRepair — Panel EDET", 14, 14);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const fecha = new Date().toLocaleDateString("es-AR", {
    day: "2-digit", month: "long", year: "numeric"
  });
  doc.text(`Exportado el ${fecha}  ·  ${reportes.length} reportes`, 14, 24);

  // ── Encabezados de columna ───────────────────────────
  let y = 44;

  doc.setFillColor(240, 244, 255);
  doc.rect(10, y - 6, pageW - 20, 10, "F");

  doc.setTextColor(30, 64, 175);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("#",     14, y);
  doc.text("TIPO",  30, y);
  doc.text("ZONA",  90, y);
  doc.text("ESTADO",130, y);
  doc.text("PRIORIDAD", 165, y);
  doc.text("FECHA",  190, y);

  y += 8;

  // ── Filas ────────────────────────────────────────────
  reportes.forEach((r, i) => {

    if (y > pageH - 20) {
      doc.addPage();

      // Encabezado en página nueva
      doc.setFillColor(13, 110, 253);
      doc.rect(0, 0, pageW, 18, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("CityRepair — Panel EDET", 14, 12);

      y = 30;

      doc.setFillColor(240, 244, 255);
      doc.rect(10, y - 6, pageW - 20, 10, "F");
      doc.setTextColor(30, 64, 175);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("#",     14, y);
      doc.text("TIPO",  30, y);
      doc.text("ZONA",  90, y);
      doc.text("ESTADO",130, y);
      doc.text("PRIORIDAD", 165, y);
      doc.text("FECHA",  190, y);
      y += 8;
    }

    // Fila alternada
    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(10, y - 5, pageW - 20, 9, "F");
    }

    // Color de estado
    const estado = (r.estado || "pendiente").toLowerCase();
    if (estado === "resuelto") doc.setTextColor(22, 163, 74);
    else if (estado.includes("rev")) doc.setTextColor(217, 119, 6);
    else doc.setTextColor(59, 130, 246);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    doc.setTextColor(100, 116, 139);
    doc.text(`${i + 1}`, 14, y);

    doc.setTextColor(17, 24, 39);
    const tipo = (r.tipo || "Sin tipo").slice(0, 22);
    doc.text(tipo, 30, y);

    const zona = (r.zona || r.ubicacion || "—").slice(0, 20);
    doc.text(zona, 90, y);

    // Badge estado
    if (estado === "resuelto") doc.setTextColor(22, 163, 74);
    else if (estado.includes("rev")) doc.setTextColor(217, 119, 6);
    else doc.setTextColor(59, 130, 246);
    doc.setFont("helvetica", "bold");
    doc.text(estado, 130, y);

    // Prioridad
    const prioridad = (r.prioridad || "media").toLowerCase();
    if (prioridad === "alta") doc.setTextColor(220, 38, 38);
    else if (prioridad === "media") doc.setTextColor(180, 100, 0);
    else doc.setTextColor(22, 163, 74);
    doc.text(prioridad, 165, y);

    // Fecha
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    const fechaR = new Date(r.fecha).toLocaleDateString("es-AR");
    doc.text(fechaR, 190, y);

    y += 10;
  });

  // ── Pie de página ─────────────────────────────────
  doc.setFillColor(13, 110, 253);
  doc.rect(0, pageH - 12, pageW, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("CityRepair © 2025 — Documento generado automáticamente", 14, pageH - 4);

  const filtro = filtroResolucion.value;
  const nombre = filtro === "todos" || !filtro
    ? "todos"
    : filtro === "resuelto"
      ? "resueltos"
      : "sin_resolver";

  doc.save(`reportes-edet_${nombre}.pdf`);
});

/* =======================================================
   LOGOUT
======================================================= */
function cerrarSesion() {
  localStorage.removeItem("cr_auth");
  window.location.href = "./login.html";
}
window.cerrarSesion = cerrarSesion;