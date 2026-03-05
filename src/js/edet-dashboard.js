import {
  collection,
  onSnapshot,
  orderBy,
  query,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

/* =======================================================
   ELEMENTOS
======================================================= */

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
   ESCUCHA FIREBASE
======================================================= */

const q = query(collection(db, "reportes"), orderBy("fecha", "desc"));

onSnapshot(q, (snap) => {

  const reportes = [];

  snap.forEach((docSnap) => {
    reportes.push({
      id: docSnap.id,
      ...docSnap.data(),
    });
  });

  REPORTES_ORIGINALES = reportes;
  aplicarFiltros();
});

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
    filtrados = filtrados.filter(r => r.fecha?.toDate() >= fDesde);
  }

  if (hasta) {
    const fHasta = new Date(hasta);
    filtrados = filtrados.filter(r => r.fecha?.toDate() <= fHasta);
  }

  renderTabla(filtrados);
  actualizarKPIs(filtrados);
  actualizarCharts(filtrados);
}

btnAplicarFiltros.addEventListener("click", aplicarFiltros);

/* =======================================================
   LISTADO MODERNO DE REPORTES
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

        const fecha = r.fecha?.toDate()
          .toLocaleDateString("es-AR");

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

        return `
          <div class="reporte-card ${estadoClass}">

            <div class="reporte-header">
              <span class="reporte-id">
                #${r.id.slice(0,6)}
              </span>

              <span class="badge ${prioridadClass}">
                ${prioridad}
              </span>
            </div>

            <div class="reporte-body">
              <h4>${r.tipo || "Sin categoría"}</h4>

              <p class="estado-label">
                ${estado}
              </p>

              <p class="fecha-label">
                ${fecha}
              </p>
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

  kpiOk.textContent =
    reportes.filter(r => r.estado === "resuelto").length;

  kpiReview.textContent =
    reportes.filter(r => r.estado?.includes("rev")).length;

  kpiHigh.textContent =
    reportes.filter(r => r.prioridad === "alta").length;
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

    if (zona.length > 20) {
      zona = zona.slice(0,20) + "...";
    }

    zonas[zona] = (zonas[zona] || 0) + 1;
  });

  if (CHART_ESTADOS) CHART_ESTADOS.destroy();
  if (CHART_ZONA) CHART_ZONA.destroy();

  CHART_ESTADOS = new Chart(ctxEstado, {
    type: "doughnut",
    data: {
      labels: ["Pendiente","En revisión","Resuelto"],
      datasets: [{
        data: [
          estados.pendiente,
          estados.revision,
          estados.resuelto
        ],
        backgroundColor: [
          "#3b82f6",
          "#ec4899",
          "#f97316"
        ]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
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
      scales: {
        x: {
          ticks: {
            maxRotation: 0,
            autoSkip: true
          }
        }
      }
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

    if (y > 280) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("reportes-edet.pdf");
});