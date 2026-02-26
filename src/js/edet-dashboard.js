// src/js/edet-dashboard.js
import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
  getDocs,
  where,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ------------------------------------------------------
// Captura de elementos
// ------------------------------------------------------
const contenedor = document.getElementById("edet-reportes-container");

const kpiTotal = document.getElementById("kpiTotal");
const kpiOk = document.getElementById("kpiOk");
const kpiReview = document.getElementById("kpiReview");
const kpiHigh = document.getElementById("kpiHigh");

const inputBusqueda = document.getElementById("buscarInput");
const selectEstado = document.getElementById("filtroEstado");
const selectPrioridad = document.getElementById("filtroPrioridad");

// ✅ NUEVO — FILTROS AVANZADOS
const filtroResolucion = document.getElementById("filtroResolucion");
const fechaDesde = document.getElementById("fechaDesde");
const fechaHasta = document.getElementById("fechaHasta");
const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");

let REPORTES_ORIGINALES = [];
let CHART_ESTADOS = null;
let CHART_ZONA = null;

/* =======================================================
   Helpers
======================================================= */

function inferirPrioridad(tipo = "") {

  switch (tipo) {

    case "poste-danado":
    case "cable-caido":
    case "medidor-quemado":
    case "transformador-riesgo":
      return "alta";

    case "corte-total":
    case "baja-tension":
    case "obra-cercana":
      return "media";

    default:
      return "baja";
  }
}

function obtenerPrioridadReporte(r) {

  if (r.prioridad) {
    return String(r.prioridad).toLowerCase();
  }

  return inferirPrioridad(r.tipo || "").toLowerCase();

}

function badgeEstado(estado = "pendiente") {

  const e = (estado || "").toLowerCase();

  if (e === "resuelto")
    return `<span class="tag tag--green">Resuelto</span>`;

  if (e.includes("rev"))
    return `<span class="tag tag--blue">En Revisión</span>`;

  return `<span class="tag tag--blue">Pendiente</span>`;
}

function badgePrioridad(p = "baja") {

  const pp = (p || "").toLowerCase();

  if (pp === "alta")
    return `<span class="tag tag--red">Alta</span>`;

  if (pp === "media")
    return `<span class="tag tag--yellow">Media</span>`;

  return `<span class="tag tag--gray">Baja</span>`;
}

function formatearFecha(ts) {

  if (!ts) return "";

  const d = ts.toDate ? ts.toDate() : new Date(ts);

  return d.toLocaleDateString("es-AR");

}

/* =======================================================
   ESCUCHA REPORTES
======================================================= */

const q = query(
  collection(db, "reportes"),
  orderBy("fecha", "desc")
);

onSnapshot(q, (snap) => {

  const reportes = [];

  snap.forEach((docSnap) => {

    reportes.push({
      id: docSnap.id,
      ...docSnap.data(),
    });

  });

  REPORTES_ORIGINALES = reportes;

  aplicarFiltrosAvanzados();

});

/* =======================================================
   FILTROS BÁSICOS
======================================================= */

function filtrarReportes() {

  const qTxt = (inputBusqueda?.value || "").toLowerCase();
  const estSel = (selectEstado?.value || "todos").toLowerCase();
  const prSel = (selectPrioridad?.value || "todas").toLowerCase();

  return REPORTES_ORIGINALES.filter((r) => {

    const texto = (
      (r.tipo || "") +
      " " +
      (r.descripcion || "") +
      " " +
      (r.ubicacion || "") +
      " " +
      r.id
    ).toLowerCase();

    const coincideTxt =
      !qTxt || texto.includes(qTxt);

    const estRep =
      (r.estado || "pendiente").toLowerCase();

    const coincideEstado =
      estSel === "todos" ||
      estRep === estSel;

    const prRep =
      obtenerPrioridadReporte(r);

    const coincidePrio =
      prSel === "todas" ||
      prRep === prSel;

    return (
      coincideTxt &&
      coincideEstado &&
      coincidePrio
    );

  });

}

[inputBusqueda, selectEstado, selectPrioridad]
.forEach((el) => {

  el?.addEventListener(
    "input",
    aplicarFiltrosAvanzados
  );

  el?.addEventListener(
    "change",
    aplicarFiltrosAvanzados
  );

});

/* =======================================================
   FILTROS AVANZADOS — CORREGIDO
======================================================= */

function aplicarFiltrosAvanzados() {

  let reportesFiltrados =
    filtrarReportes();

  const resolucion =
    filtroResolucion?.value || "todos";

  const desde =
    fechaDesde?.value;

  const hasta =
    fechaHasta?.value;

  // FILTRO RESOLUCIÓN

  if (resolucion === "resuelto") {

    reportesFiltrados =
      reportesFiltrados.filter(
        r =>
          (r.estado || "")
            .toLowerCase()
            === "resuelto"
      );

  }

  if (resolucion === "no_resuelto") {

    reportesFiltrados =
      reportesFiltrados.filter(
        r =>
          (r.estado || "")
            .toLowerCase()
            !== "resuelto"
      );

  }

  // FILTRO FECHA DESDE

  if (desde) {

    const fechaDesdeObj =
      new Date(desde);

    reportesFiltrados =
      reportesFiltrados.filter(r => {

        if (!r.fecha) return false;

        const fecha =
          r.fecha.toDate
            ? r.fecha.toDate()
            : new Date(r.fecha);

        return fecha >= fechaDesdeObj;

      });

  }

  // FILTRO FECHA HASTA

  if (hasta) {

    const fechaHastaObj =
      new Date(hasta);

    reportesFiltrados =
      reportesFiltrados.filter(r => {

        if (!r.fecha) return false;

        const fecha =
          r.fecha.toDate
            ? r.fecha.toDate()
            : new Date(r.fecha);

        return fecha <= fechaHastaObj;

      });

  }

  renderTabla(reportesFiltrados);
  actualizarKPIs(reportesFiltrados);
  actualizarCharts(reportesFiltrados);

}

// ✅ BOTÓN APLICAR FILTROS

btnAplicarFiltros?.addEventListener(
  "click",
  aplicarFiltrosAvanzados
);

/* =======================================================
   RENDER TABLA
======================================================= */

function renderTabla(reportes = []) {

  if (!contenedor) return;

  if (reportes.length === 0) {

    contenedor.innerHTML =
      `<p>No hay reportes.</p>`;

    return;

  }

  contenedor.innerHTML =
    reportes.map(r => {

      const prioridad =
        obtenerPrioridadReporte(r);

      const estado =
        r.estado || "pendiente";

      const fecha =
        formatearFecha(r.fecha);

      return `
        <div class="list-row">

          <div>#${r.id.slice(0,6)}</div>

          <div>${r.tipo}</div>

          <div>${badgeEstado(estado)}</div>

          <div>${badgePrioridad(prioridad)}</div>

          <div>${fecha}</div>

        </div>
      `;

    }).join("");

}

/* =======================================================
   KPIs
======================================================= */

function actualizarKPIs(reportes) {

  if (!reportes) return;

  kpiTotal.textContent =
    reportes.length;

  kpiOk.textContent =
    reportes.filter(
      r =>
        r.estado === "resuelto"
    ).length;

  kpiReview.textContent =
    reportes.filter(
      r =>
        r.estado?.includes("rev")
    ).length;

  kpiHigh.textContent =
    reportes.filter(
      r =>
        obtenerPrioridadReporte(r)
        === "alta"
    ).length;

}