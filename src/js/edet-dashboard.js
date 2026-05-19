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

    let zona = (r.ubicacion || "Sin zona").split(",")[0];
    if (zona.length > 20) zona = zona.slice(0,20) + "...";
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

document.getElementById("btnExportarPDF")
.addEventListener("click", () => {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Reporte CityRepair EDET", 20, 20);
  doc.setFontSize(12);

  let y = 40;

  REPORTES_ORIGINALES.forEach((r,i) => {
    doc.text(`${i+1}. ${r.tipo}`, 20, y);
    doc.text(`Estado: ${r.estado}`, 20, y+6);
    y += 16;
    if (y > 280) { doc.addPage(); y = 20; }
  });

  doc.save("reportes-edet.pdf");
});