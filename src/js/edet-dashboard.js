// src/js/edet-dashboard.js
import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
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

let REPORTES_ORIGINALES = [];
let CHART_ESTADOS = null;
let CHART_ZONA = null;

/* =======================================================
   Helpers
======================================================= */
/**
 * Prioridad de respaldo por tipo de problema.
 * Se usa SOLO si el reporte no tiene campo "prioridad" en Firestore
 * (reportes viejos).
 */
function inferirPrioridad(tipo = "") {
  switch (tipo) {
    // ⚠️ MÁS PELIGROSOS
    case "poste-danado":
    case "cable-caido":
    case "medidor-quemado":
    case "transformador-riesgo":
      return "alta";

    // ⚡ CORTES Y RIESGO MODERADO
    case "corte-total":
    case "baja-tension":
    case "obra-cercana":
      return "media";

    // 💡 COSAS MENOS URGENTES
    case "luminaria-publica":
    case "otros":
    default:
      return "baja";
  }
}

/**
 * Devuelve la prioridad REAL del reporte:
 * 1) Usa r.prioridad si existe
 * 2) Si no, infiere por tipo (para reportes viejos)
 */
function obtenerPrioridadReporte(r) {
  if (r.prioridad) {
    return String(r.prioridad).toLowerCase();
  }
  return inferirPrioridad(r.tipo || "").toLowerCase();
}

function badgeEstado(estado = "pendiente") {
  const e = (estado || "").toLowerCase();
  if (e === "resuelto")
    return `<span class="tag tag--green"><i class="bi bi-check2-circle"></i> Resuelto</span>`;
  if (e.includes("rev"))
    return `<span class="tag tag--blue"><i class="bi bi-hourglass-split"></i> En Revisión</span>`;
  return `<span class="tag tag--blue"><i class="bi bi-hourglass-split"></i> Pendiente</span>`;
}

function badgePrioridad(p = "baja") {
  const pp = (p || "").toLowerCase();
  if (pp === "alta")
    return `<span class="tag tag--red"><i class="bi bi-exclamation-triangle"></i> Alta</span>`;
  if (pp === "media")
    return `<span class="tag tag--yellow"><i class="bi bi-exclamation-diamond"></i> Media</span>`;
  return `<span class="tag tag--gray"><i class="bi bi-dot"></i> Baja</span>`;
}

function formatearFecha(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* =======================================================
   Escucha en vivo los reportes
======================================================= */
const q = query(collection(db, "reportes"), orderBy("fecha", "desc"));
onSnapshot(q, (snap) => {
  const reportes = [];
  snap.forEach((docSnap) => {
    reportes.push({ id: docSnap.id, ...docSnap.data() });
  });

  REPORTES_ORIGINALES = reportes;

  const filtrados = filtrarReportes();
  renderTabla(filtrados);
  actualizarKPIs(filtrados);
  actualizarCharts(filtrados);
});

/* =======================================================
   Filtros
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
    const coincideTxt = !qTxt || texto.includes(qTxt);

    const estRep = (r.estado || "pendiente").toLowerCase();
    const coincideEstado = estSel === "todos" || estRep === estSel;

    // 👇 AHORA USAMOS LA PRIORIDAD REAL DEL REPORTE
    const prRep = obtenerPrioridadReporte(r);
    const coincidePrio = prSel === "todas" || prRep === prSel;

    return coincideTxt && coincideEstado && coincidePrio;
  });
}

[inputBusqueda, selectEstado, selectPrioridad].forEach((el) => {
  el?.addEventListener("input", () => {
    const filtrados = filtrarReportes();
    renderTabla(filtrados);
    actualizarKPIs(filtrados);
    actualizarCharts(filtrados);
  });
  el?.addEventListener("change", () => {
    const filtrados = filtrarReportes();
    renderTabla(filtrados);
    actualizarKPIs(filtrados);
    actualizarCharts(filtrados);
  });
});

/* =======================================================
   Render tabla
======================================================= */
function renderTabla(reportes = []) {
  if (!contenedor) return;

  if (reportes.length === 0) {
    contenedor.innerHTML = `<p class="muted" style="padding:14px 18px;">No hay reportes para este filtro.</p>`;
    return;
  }

  const filas = reportes
    .map((r) => {
      const prioridad = obtenerPrioridadReporte(r); // 👈 usa prioridad guardada o inferida
      const estado = r.estado || "pendiente";
      const fecha = formatearFecha(r.fecha);

      return `
      <div class="list-row" data-id="${r.id}">
        <div>
          <div class="rep-code">#${r.id.slice(0, 6)}</div>
          <div class="rep-date"><i class="bi bi-calendar"></i> ${
            fecha || "Sin fecha"
          }</div>
        </div>
        <div>
          <div class="rep-title">${r.tipo || "Reporte"}</div>
          <div class="rep-loc"><i class="bi bi-geo-alt"></i> ${
            r.ubicacion || "Sin dirección"
          }</div>
        </div>
        <div>${badgeEstado(estado)}</div>
        <div>${badgePrioridad(prioridad)}</div>
        <div>
          <span class="chip chip--pill">
            <i class="bi bi-person-badge"></i> ${
              r.asignadoA || "Sin asignar"
            }
          </span>
        </div>
        <div class="ta-right">
          <button class="btn-resolver" data-id="${r.id}">
            <i class="bi bi-check2"></i> Resolver
          </button>
          <button class="btn-asignar" data-id="${r.id}">
            <i class="bi bi-person-plus"></i> Asignar
          </button>
        </div>
      </div>
    `;
    })
    .join("");

  contenedor.innerHTML = filas;

  // listeners
  contenedor.querySelectorAll(".btn-resolver").forEach((btn) => {
    btn.addEventListener("click", onResolverClick);
  });
  contenedor.querySelectorAll(".btn-asignar").forEach((btn) => {
    btn.addEventListener("click", onAsignarClick);
  });
}

/* =======================================================
   Acciones de administrador
======================================================= */
async function onAsignarClick(e) {
  const id = e.currentTarget.dataset.id;

  // NUEVO: pedimos nombre y correo del técnico
  const nombre = prompt("Nombre del técnico / cuadrilla:");
  if (!nombre) return;

  const email = prompt(
    "Correo del técnico (el mismo con el que inicia sesión en EDET):"
  );
  if (!email) return;

  try {
    await updateDoc(doc(db, "reportes", id), {
      asignadoA: nombre,
      tecnicoEmail: email.toLowerCase(), // 👈 esto usará el panel del técnico
      estado: "en revisión",
      ultimaActualizacion: new Date(),
      // nota vacía por ahora, se completa cuando el técnico resuelve
      notaResolucion: "",
    });

    window.mostrarAlerta?.("Reporte asignado correctamente", "success", {
      titulo: "Asignado",
    });
  } catch (err) {
    console.error(err);
    window.mostrarAlerta?.("No se pudo asignar el reporte", "danger", {
      titulo: "Error",
    });
  }
}

async function onResolverClick(e) {
  const id = e.currentTarget.dataset.id;
  const nota = prompt(
    "Opcional: escribe una nota para el ciudadano (p. ej. 'se cambió el transformador'):"
  );

  try {
    await updateDoc(doc(db, "reportes", id), {
      estado: "resuelto",
      fechaResuelto: new Date(),
      notaResolucion: nota || "El reporte fue marcado como resuelto.",
    });
    window.mostrarAlerta?.("Reporte marcado como resuelto", "success", {
      titulo: "Listo",
    });
  } catch (err) {
    console.error(err);
    window.mostrarAlerta?.("No se pudo actualizar el reporte", "danger", {
      titulo: "Error",
    });
  }
}

/* =======================================================
   KPIs
======================================================= */
function actualizarKPIs(reportes = []) {
  const total = reportes.length;
  const resueltos = reportes.filter(
    (r) => (r.estado || "").toLowerCase() === "resuelto"
  ).length;
  const enRev = reportes.filter((r) =>
    (r.estado || "").toLowerCase().includes("rev")
  ).length;

  // 👇 usa prioridad REAL (campo + fallback)
  const alta = reportes.filter(
    (r) => obtenerPrioridadReporte(r) === "alta"
  ).length;

  if (kpiTotal) kpiTotal.textContent = total;
  if (kpiOk) kpiOk.textContent = resueltos;
  if (kpiReview) kpiReview.textContent = enRev;
  if (kpiHigh) kpiHigh.textContent = alta;
}

/* =======================================================
   Gráficos
======================================================= */
function actualizarCharts(reportes = []) {
  if (typeof Chart === "undefined") return;

  // ---------- Estados ----------
  const estados = { pendiente: 0, revision: 0, resuelto: 0 };
  reportes.forEach((r) => {
    const e = (r.estado || "pendiente").toLowerCase();
    if (e === "resuelto") estados.resuelto++;
    else if (e.includes("rev")) estados.revision++;
    else estados.pendiente++;
  });

  const ctx1 = document.getElementById("chartStatus");
  if (ctx1) {
    if (CHART_ESTADOS) {
      CHART_ESTADOS.data.datasets[0].data = [
        estados.pendiente,
        estados.revision,
        estados.resuelto,
      ];
      CHART_ESTADOS.update();
    } else {
      CHART_ESTADOS = new Chart(ctx1, {
        type: "doughnut",
        data: {
          labels: ["Pendiente", "En Revisión", "Resuelto"],
          datasets: [
            {
              data: [
                estados.pendiente,
                estados.revision,
                estados.resuelto,
              ],
              backgroundColor: ["#bfdbfe", "#93c5fd", "#22c55e"],
            },
          ],
        },
        options: {
          plugins: { legend: { position: "bottom" } },
          cutout: "60%",
        },
      });
    }
  }

  // ---------- Zonas ----------
  const zonas = {};
  reportes.forEach((r) => {
    const z = r.zona || "Sin zona";
    zonas[z] = (zonas[z] || 0) + 1;
  });

  const ctx2 = document.getElementById("chartZones");
  if (ctx2) {
    const labels = Object.keys(zonas);
    const data = Object.values(zonas);

    if (CHART_ZONA) {
      CHART_ZONA.data.labels = labels;
      CHART_ZONA.data.datasets[0].data = data;
      CHART_ZONA.update();
    } else {
      CHART_ZONA = new Chart(ctx2, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label: "Reportes",
              data,
              backgroundColor: "#3b82f6",
            },
          ],
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
    }
  }
}
