// src/js/edet-dashboard.js
import { db } from './firebase.js';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// ------------------------------------------------------
// Captura de elementos
// ------------------------------------------------------
const contenedor      = document.getElementById('edet-reportes-container');
const kpiTotal        = document.getElementById('kpiTotal');
const kpiOk           = document.getElementById('kpiOk');
const kpiReview       = document.getElementById('kpiReview');
const kpiHigh         = document.getElementById('kpiHigh');

const inputBusqueda   = document.getElementById('buscarInput');
const selectEstado    = document.getElementById('filtroEstado');
const selectPrioridad = document.getElementById('filtroPrioridad');

// acá vamos a guardar lo que viene de Firestore
let REPORTES_ORIGINALES = [];
let CHART_ESTADOS = null;
let CHART_ZONA    = null;

/* =======================================================
   Helpers
======================================================= */

// prioridad deducida por tipo
function inferirPrioridad(tipo = '') {
  const t = (tipo || '').toLowerCase();
  if (t.includes('corte')) return 'alta';
  if (t.includes('poste')) return 'media';
  if (t.includes('cable')) return 'media';
  return 'baja';
}

function badgeEstado(estado = 'pendiente') {
  const e = estado.toLowerCase();
  if (e === 'resuelto')
    return `<span class="tag tag--green"><i class="bi bi-check2-circle"></i> Resuelto</span>`;
  if (e.includes('rev'))
    return `<span class="tag tag--blue"><i class="bi bi-hourglass-split"></i> En Revisión</span>`;
  return `<span class="tag tag--blue"><i class="bi bi-hourglass-split"></i> Pendiente</span>`;
}

function badgePrioridad(p = 'baja') {
  const pp = p.toLowerCase();
  if (pp === 'alta')
    return `<span class="tag tag--red"><i class="bi bi-exclamation-triangle"></i> Alta</span>`;
  if (pp === 'media')
    return `<span class="tag tag--yellow"><i class="bi bi-exclamation-diamond"></i> Media</span>`;
  return `<span class="tag tag--gray"><i class="bi bi-dot"></i> Baja</span>`;
}

function formatearFecha(ts) {
  if (!ts) return '';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/* =======================================================
   Escucha en vivo los reportes
======================================================= */
const q = query(collection(db, 'reportes'), orderBy('fecha', 'desc'));
onSnapshot(q, (snap) => {
  const reportes = [];
  snap.forEach(docSnap => {
    reportes.push({ id: docSnap.id, ...docSnap.data() });
  });

  // guardo en memoria
  REPORTES_ORIGINALES = reportes;

  // Aplico filtros actuales (si hay)
  const filtrados = filtrarReportes();
  renderTabla(filtrados);
  actualizarKPIs(filtrados);
  actualizarCharts(filtrados);
});

/* =======================================================
   Filtros
======================================================= */
function filtrarReportes() {
  const qTxt   = (inputBusqueda?.value || '').toLowerCase();
  const estSel = (selectEstado?.value || 'todos').toLowerCase();
  const prSel  = (selectPrioridad?.value || 'todas').toLowerCase();

  return REPORTES_ORIGINALES.filter(r => {
    // texto
    const texto = (
      (r.tipo || '') + ' ' +
      (r.descripcion || '') + ' ' +
      (r.ubicacion || '') + ' ' +
      r.id
    ).toLowerCase();
    const coincideTxt = !qTxt || texto.includes(qTxt);

    // estado
    const estRep = (r.estado || 'pendiente').toLowerCase();
    const coincideEstado = estSel === 'todos' || estRep === estSel;

    // prioridad deducida
    const prRep = inferirPrioridad(r.tipo).toLowerCase();
    const coincidePrio = prSel === 'todas' || prRep === prSel;

    return coincideTxt && coincideEstado && coincidePrio;
  });
}

// engancho inputs a filtros
[inputBusqueda, selectEstado, selectPrioridad].forEach(el => {
  el?.addEventListener('input', () => {
    const filtrados = filtrarReportes();
    renderTabla(filtrados);
    actualizarKPIs(filtrados);
    actualizarCharts(filtrados);
  });
  el?.addEventListener('change', () => {
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

  const filas = reportes.map((r) => {
    const prioridad = inferirPrioridad(r.tipo);
    const estado    = r.estado || 'pendiente';
    const fecha     = formatearFecha(r.fecha);

    return `
      <div class="list-row" data-id="${r.id}">
        <!-- Col 1 -->
        <div>
          <div class="rep-code">#${r.id.slice(0,6)}</div>
          <div class="rep-date"><i class="bi bi-calendar"></i> ${fecha || 'Sin fecha'}</div>
        </div>

        <!-- Col 2 -->
        <div>
          <div class="rep-title">${r.tipo || 'Reporte'}</div>
          <div class="rep-loc"><i class="bi bi-geo-alt"></i> ${r.ubicacion || 'Sin dirección'}</div>
        </div>

        <!-- Col 3 -->
        <div>${badgeEstado(estado)}</div>

        <!-- Col 4 -->
        <div>${badgePrioridad(prioridad)}</div>

        <!-- Col 5 -->
        <div>
          <span class="chip chip--pill">
            <i class="bi bi-person-badge"></i> ${r.asignadoA || 'Sin asignar'}
          </span>
        </div>

        <!-- Col 6 -->
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
  }).join('');

  contenedor.innerHTML = filas;

  // listeners
  contenedor.querySelectorAll('.btn-resolver').forEach(btn => {
    btn.addEventListener('click', onResolverClick);
  });
  contenedor.querySelectorAll('.btn-asignar').forEach(btn => {
    btn.addEventListener('click', onAsignarClick);
  });
}

/* =======================================================
   Acciones de administrador
======================================================= */

async function onResolverClick(e) {
  const id = e.currentTarget.dataset.id;
  try {
    await updateDoc(doc(db, "reportes", id), {
      estado: "resuelto"
    });
    window.mostrarAlerta?.("Reporte marcado como resuelto", "success", { titulo: "Listo" });
  } catch (err) {
    console.error(err);
    window.mostrarAlerta?.("No se pudo actualizar el reporte", "danger", { titulo: "Error" });
  }
}

async function onAsignarClick(e) {
  const id = e.currentTarget.dataset.id;
  const asignadoA = prompt("Asignar a (cuadrilla / responsable):");
  if (!asignadoA) return;
  try {
    await updateDoc(doc(db, "reportes", id), {
      asignadoA,
      estado: "en revisión"
    });
    window.mostrarAlerta?.("Reporte asignado correctamente", "success", { titulo: "Asignado" });
  } catch (err) {
    console.error(err);
    window.mostrarAlerta?.("No se pudo asignar el reporte", "danger", { titulo: "Error" });
  }
}

/* =======================================================
   KPIs
======================================================= */
function actualizarKPIs(reportes = []) {
  const total     = reportes.length;
  const resueltos = reportes.filter(r => (r.estado || '').toLowerCase() === 'resuelto').length;
  const enRev     = reportes.filter(r => (r.estado || '').toLowerCase().includes('rev')).length;
  const alta      = reportes.filter(r => inferirPrioridad(r.tipo) === 'alta').length;
  if (kpiTotal)  kpiTotal.textContent  = total;
  if (kpiOk)     kpiOk.textContent     = resueltos;
  if (kpiReview) kpiReview.textContent = enRev;
  if (kpiHigh)   kpiHigh.textContent   = alta;
}

/* =======================================================
   Gráficos
======================================================= */
function actualizarCharts(reportes = []) {
  if (typeof Chart === 'undefined') return;

  // ---- Estados ----
  const estados = { pendiente:0, revision:0, resuelto:0 };
  reportes.forEach(r => {
    const e = (r.estado || 'pendiente').toLowerCase();
    if (e === 'resuelto') estados.resuelto++;
    else if (e.includes('rev')) estados.revision++;
    else estados.pendiente++;
  });

  const ctx1 = document.getElementById('chartStatus');
  if (ctx1) {
    if (CHART_ESTADOS) {
      CHART_ESTADOS.data.datasets[0].data = [
        estados.pendiente,
        estados.revision,
        estados.resuelto
      ];
      CHART_ESTADOS.update();
    } else {
      CHART_ESTADOS = new Chart(ctx1, {
        type:'doughnut',
        data:{
          labels:['Pendiente','En Revisión','Resuelto'],
          datasets:[{
            data:[estados.pendiente, estados.revision, estados.resuelto],
            backgroundColor:['#bfdbfe','#93c5fd','#22c55e']
          }]
        },
        options:{ plugins:{ legend:{ position:'bottom' }}, cutout:'60%' }
      });
    }
  }

  // ---- Zonas (placeholder) ----
  const zonas = {};
reportes.forEach(r => {
  const z = r.zona || 'Sin zona';
  zonas[z] = (zonas[z] || 0) + 1;
});

const ctx2 = document.getElementById('chartZones');
if (ctx2) {
  new Chart(ctx2, {
    type: 'bar',
    data: {
      labels: Object.keys(zonas),
      datasets: [{
        label: 'Reportes',
        data: Object.values(zonas)
      }]
    },
    options: { plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }
  });
}
}
