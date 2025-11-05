// src/js/edet-dashboard.js
import { db } from './firebase.js';
import {
  collection,
  getDocs,
  orderBy,
  query
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const contenedor = document.getElementById('edet-reportes-container');
const kpiTotal   = document.getElementById('kpiTotal');
const kpiOk      = document.getElementById('kpiOk');
const kpiReview  = document.getElementById('kpiReview');
const kpiHigh    = document.getElementById('kpiHigh');

/**
 * Como en la colección no guardás prioridad,
 * la deducimos por tipo.
 */
function inferirPrioridad(tipo = '') {
  const t = (tipo || '').toLowerCase();
  if (t.includes('corte')) return 'Alta';
  if (t.includes('poste')) return 'Media';
  if (t.includes('cable')) return 'Media';
  return 'Baja';
}

function badgeEstado(estado = 'pendiente') {
  const e = estado.toLowerCase();
  if (e === 'resuelto')
    return `<span class="tag tag--green"><i class="bi bi-check2-circle"></i> Resuelto</span>`;
  if (e.includes('rev'))
    return `<span class="tag tag--blue"><i class="bi bi-hourglass-split"></i> En Revisión</span>`;
  // default
  return `<span class="tag tag--blue"><i class="bi bi-hourglass-split"></i> Pendiente</span>`;
}

function badgePrioridad(p = 'Baja') {
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

async function cargarReportes() {
  try {
    // traemos todos los reportes reales
    const q = query(collection(db, 'reportes'), orderBy('fecha', 'desc'));
    const snap = await getDocs(q);

    const reportes = [];
    snap.forEach(doc => {
      reportes.push({ id: doc.id, ...doc.data() });
    });

    renderTabla(reportes);
    actualizarKPIs(reportes);
    actualizarCharts(reportes);
  } catch (err) {
    console.error('Error cargando reportes para EDET:', err);
    window.mostrarAlerta?.('No se pudieron cargar los reportes', 'danger', { titulo: 'Error' });
  }
}

function renderTabla(reportes = []) {
  if (!contenedor) return;

  if (reportes.length === 0) {
    contenedor.innerHTML = `<p class="muted" style="padding:14px 18px;">No hay reportes cargados.</p>`;
    return;
  }

  const filas = reportes.map((r) => {
    const prioridad = inferirPrioridad(r.tipo);
    const estado    = r.estado || 'pendiente';
    const fecha     = formatearFecha(r.fecha);

    return `
      <div class="list-row">
        <!-- Col 1: código + fecha + ciudadano -->
        <div>
          <div class="rep-code">#${r.id.slice(0,6)}</div>
          <div class="rep-date">
            <i class="bi bi-calendar"></i> ${fecha || 'Sin fecha'} • Ciudadano
          </div>
        </div>

        <!-- Col 2: tipo + ubicación -->
        <div>
          <div class="rep-title">${r.tipo || 'Reporte'}</div>
          <div class="rep-loc">
            <i class="bi bi-geo-alt"></i> ${r.ubicacion || 'Sin dirección'}
          </div>
        </div>

        <!-- Col 3: estado -->
        <div>${badgeEstado(estado)}</div>

        <!-- Col 4: prioridad (deducida) -->
        <div>${badgePrioridad(prioridad)}</div>

        <!-- Col 5: asignado -->
        <div>
          <span class="chip chip--pill">
            <i class="bi bi-person-badge"></i> Sin asignar
          </span>
        </div>

        <!-- Col 6: acciones -->
        <div class="ta-right">
          <button class="btn-resolver" data-id="${r.id}">
            <i class="bi bi-check2"></i> Resolver
          </button>
          <button class="btn-icon" title="Ver" data-id="${r.id}">
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  contenedor.innerHTML = filas;

  // listeners de ejemplo
  contenedor.querySelectorAll('.btn-resolver').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idRep = e.currentTarget.dataset.id;
      console.log('resolver reporte', idRep);
      // acá después podés hacer updateDoc(...) para poner estado = 'resuelto'
    });
  });
}

function actualizarKPIs(reportes = []) {
  const total     = reportes.length;
  const resueltos = reportes.filter(r => (r.estado || '').toLowerCase() === 'resuelto').length;
  const enRev     = reportes.filter(r => (r.estado || '').toLowerCase().includes('revision')).length
                 + reportes.filter(r => (r.estado || '').toLowerCase().includes('revisión')).length;
  const alta      = reportes.filter(r => inferirPrioridad(r.tipo) === 'Alta').length;

  if (kpiTotal)  kpiTotal.textContent  = total;
  if (kpiOk)     kpiOk.textContent     = resueltos;
  if (kpiReview) kpiReview.textContent = enRev;
  if (kpiHigh)   kpiHigh.textContent   = alta;
}

function actualizarCharts(reportes = []) {
  if (typeof Chart === 'undefined') return;

  // Estados
  const estados = { pendiente:0, revision:0, resuelto:0 };
  reportes.forEach(r => {
    const e = (r.estado || 'pendiente').toLowerCase();
    if (e === 'resuelto') estados.resuelto++;
    else if (e.includes('rev')) estados.revision++;
    else estados.pendiente++;
  });

  const ctx1 = document.getElementById('chartStatus');
  if (ctx1) {
    new Chart(ctx1, {
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

  // Zonas: no las guardás, así que mostramos una sola barra "Ciudad"
  const ctx2 = document.getElementById('chartZones');
  if (ctx2) {
    new Chart(ctx2, {
      type:'bar',
      data:{
        labels:['Reportes'],
        datasets:[{ label:'Reportes', data:[reportes.length] }]
      },
      options:{ plugins:{ legend:{ display:false }}, scales:{ y:{ beginAtZero:true } } }
    });
  }
}

// start
cargarReportes();
