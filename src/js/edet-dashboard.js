import { db } from "./firebase.js";
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
   TABLA
======================================================= */

function renderTabla(reportes) {

  if (!reportes.length) {
    contenedor.innerHTML = "<p>No hay reportes.</p>";
    return;
  }

  contenedor.innerHTML = reportes.map(r => `
    <div class="list-row">
      <div>#${r.id.slice(0,6)}</div>
      <div>${r.tipo}</div>
      <div>${r.estado}</div>
      <div>${r.fecha?.toDate().toLocaleDateString("es-AR")}</div>
    </div>
  `).join("");

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

    const zona = r.ubicacion || "Sin zona";

    if (!zonas[zona]) zonas[zona] = 0;
    zonas[zona]++;

  });

  if (CHART_ESTADOS) CHART_ESTADOS.destroy();
  if (CHART_ZONA) CHART_ZONA.destroy();

  CHART_ESTADOS = new Chart(
    document.getElementById("chartStatus"),
    {
      type: "doughnut",
      data: {
        labels: ["Pendiente","En revisión","Resuelto"],
        datasets: [{
          data: [
            estados.pendiente,
            estados.revision,
            estados.resuelto
          ]
        }]
      }
    }
  );

  CHART_ZONA = new Chart(
    document.getElementById("chartZones"),
    {
      type: "bar",
      data: {
        labels: Object.keys(zonas),
        datasets: [{
          label: "Reportes",
          data: Object.values(zonas)
        }]
      }
    }
  );

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