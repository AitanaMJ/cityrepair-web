// src/js/edet-dashboard.js
import { db } from "./firebase.js";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  doc,
  updateDoc,
   getDocs,      // 👈 FALTABA
  where,
  deleteDoc,       // 👈 FALTABA
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
      const prioridad = obtenerPrioridadReporte(r); 
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
        <td class="acciones">
  <button class="btn-blue btn-asignar" data-id="${r.id}">
    <i class="bi bi-person-plus"></i> Asignar
  </button>

  <button class="btn-delete-admin" data-id="${r.id}">
    <i class="bi bi-trash"></i>
  </button>
</td>
      </div>
    `;
    })
    .join("");

  contenedor.innerHTML = filas;

  // listeners
  contenedor.querySelectorAll(".btn-asignar").forEach((btn) => {
    btn.addEventListener("click", onAsignarClick);
  });
}


// =======================================================
// ELIMINAR REPORTE CON ANIMACIÓN + SWEETALERT2
// =======================================================
contenedor.addEventListener("click", async (e) => {
  const btn = e.target.closest(".btn-delete-admin");
  if (!btn) return;

  const id = btn.dataset.id;
  const fila = btn.closest(".list-row");

  // --- Confirmación bonita ---
  const result = await Swal.fire({
    title: "¿Eliminar reporte?",
    text: "Esta acción no se puede deshacer.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
  });

  if (!result.isConfirmed) return;

  try {
    // Animación antes de eliminar
    fila.classList.add("report-delete-anim");

    setTimeout(async () => {
      await deleteDoc(doc(db, "reportes", id));
      fila.remove();

      // Mensaje de éxito bonito
      Swal.fire({
        title: "Eliminado",
        text: "El reporte fue eliminado correctamente.",
        icon: "success",
        timer: 1800,
        showConfirmButton: false
      });

    }, 300);

  } catch (err) {
    console.error(err);

    Swal.fire({
      title: "Error",
      text: "No se pudo eliminar el reporte.",
      icon: "error",
    });

    fila.classList.remove("report-delete-anim");
  }
});

/* =======================================================
   Acciones de administrador
======================================================= */
let REPORTE_A_ASIGNAR = null;

// ABRIR MODAL
async function onAsignarClick(e) {
  REPORTE_A_ASIGNAR = e.currentTarget.dataset.id;

  // Mostrar modal
  document.getElementById("modalAsignarTecnico").classList.remove("hidden");

  // Cargar técnicos
  const sel = document.getElementById("selectTecnicos");
  sel.innerHTML = `<option>Cargando...</option>`;

  try {
    const snap = await getDocs(
      query(collection(db, "usuarios"), where("rol", "==", "tecnico"))
    );

    sel.innerHTML = "";

    snap.forEach((d) => {
      const u = d.data();
      sel.innerHTML += `
        <option value="${u.email}">${u.nombre} (${u.email})</option>
      `;
    });

    if (!sel.innerHTML.trim()) {
      sel.innerHTML = `<option value="">No hay técnicos registrados</option>`;
    }
  } catch (err) {
    console.error(err);
  }
}

// BOTÓN CANCELAR
document.getElementById("btnCancelarAsignacion").onclick = () => {
  document.getElementById("modalAsignarTecnico").classList.add("hidden");
  REPORTE_A_ASIGNAR = null;
};

// BOTÓN CONFIRMAR
document.getElementById("btnConfirmarAsignacion").onclick = async () => {
  const sel = document.getElementById("selectTecnicos");
  const email = sel.value;
  if (!email) return;

  try {
    await updateDoc(doc(db, "reportes", REPORTE_A_ASIGNAR), {
      asignadoA: sel.options[sel.selectedIndex].text.split(" (")[0],
      tecnicoEmail: email.toLowerCase(),
      estado: "en revisión",
      ultimaActualizacion: new Date()
    });

    window.mostrarAlerta?.("Técnico asignado correctamente", "success");

  } catch (err) {
    console.error(err);
    window.mostrarAlerta?.("No se pudo asignar técnico", "danger");
  }

  // Cerrar modal
  document.getElementById("modalAsignarTecnico").classList.add("hidden");
  REPORTE_A_ASIGNAR = null;
};





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
