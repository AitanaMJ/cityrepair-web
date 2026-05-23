const API = "http://localhost:3000/api";

/* =======================================================
   ELEMENTOS
======================================================= */
const contenedor        = document.getElementById("edet-reportes-container");
const kpiTotal          = document.getElementById("kpiTotal");
const kpiOk             = document.getElementById("kpiOk");
const kpiReview         = document.getElementById("kpiReview");
const kpiHigh           = document.getElementById("kpiHigh");
const filtroResolucion  = document.getElementById("filtroResolucion");
const filtroPrioridad   = document.getElementById("filtroPrioridad");
const filtroTipo        = document.getElementById("filtroTipo");
const filtroZona        = document.getElementById("filtroZona");
const fechaDesde        = document.getElementById("fechaDesde");
const fechaHasta        = document.getElementById("fechaHasta");
const btnAplicarFiltros = document.getElementById("btnAplicarFiltros");
const btnLimpiarFiltros = document.getElementById("btnLimpiarFiltros");
const ctxEstado         = document.getElementById("chartStatus");
const ctxZona           = document.getElementById("chartZones");

let REPORTES_ORIGINALES = [];
let REPORTES_FILTRADOS  = [];
let CHART_ESTADOS       = null;
let CHART_ZONA          = null;

/* =======================================================
   CARGAR DESDE BACKEND
======================================================= */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res  = await fetch(`${API}/reportes`);
    const data = await res.json();

    REPORTES_ORIGINALES = data.map(r => ({ ...r, fecha: new Date(r.fecha) }));

    aplicarFiltros();
  } catch (err) {
    console.error("Error cargando reportes:", err);
    contenedor.innerHTML = "<p class='empty-state'>Error cargando reportes</p>";
  }
});

/* =======================================================
   FILTROS
======================================================= */
function aplicarFiltros() {
  let filtrados = [...REPORTES_ORIGINALES];

  const resolucion = filtroResolucion?.value || "todos";
  const prioridad  = filtroPrioridad?.value  || "todos";
  const tipo       = filtroTipo?.value       || "todos";
  const zona       = filtroZona?.value       || "todos";
  const desde      = fechaDesde?.value       || "";
  const hasta      = fechaHasta?.value       || "";

  if (resolucion === "resuelto")
    filtrados = filtrados.filter(r => r.estado === "resuelto");
  if (resolucion === "no_resuelto")
    filtrados = filtrados.filter(r => r.estado !== "resuelto");
  if (prioridad !== "todos")
    filtrados = filtrados.filter(r => (r.prioridad || "").toLowerCase() === prioridad);
  if (tipo !== "todos")
    filtrados = filtrados.filter(r => (r.tipo || "").toLowerCase() === tipo);
  if (zona !== "todos")
    filtrados = filtrados.filter(r => (r.zona || "") === zona);
  if (desde)
    filtrados = filtrados.filter(r => new Date(r.fecha) >= new Date(desde));
  if (hasta)
    filtrados = filtrados.filter(r => new Date(r.fecha) <= new Date(hasta));

  REPORTES_FILTRADOS = filtrados;
  renderTabla(filtrados);
  actualizarKPIs(filtrados);
  actualizarCharts(filtrados);
}

btnAplicarFiltros?.addEventListener("click", aplicarFiltros);

btnLimpiarFiltros?.addEventListener("click", () => {
  if (filtroResolucion) filtroResolucion.value = "todos";
  if (filtroPrioridad)  filtroPrioridad.value  = "todos";
  if (filtroTipo)       filtroTipo.value        = "todos";
  if (filtroZona)       filtroZona.value        = "todos";
  if (fechaDesde)       fechaDesde.value        = "";
  if (fechaHasta)       fechaHasta.value        = "";
  aplicarFiltros();
});

/* =======================================================
   CAMBIAR ESTADO
======================================================= */
async function cambiarEstado(id, nuevoEstado) {
  try {
    const res = await fetch(`${API}/reportes/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (!res.ok) throw new Error("Error actualizando estado");

    const reporte = REPORTES_ORIGINALES.find(r => r.id == id);
    if (reporte) reporte.estado = nuevoEstado;
    aplicarFiltros();
  } catch (err) {
    alert("Error al cambiar el estado");
  }
}
window.cambiarEstado = cambiarEstado;

/* =======================================================
   LISTADO DE REPORTES
======================================================= */
function renderTabla(reportes) {
  if (!reportes.length) {
    contenedor.innerHTML = "<p class='empty-state'>No hay reportes disponibles</p>";
    return;
  }

  contenedor.innerHTML = `
    <div class="reportes-wrapper">
      ${reportes.map(r => {
        const estado    = (r.estado    || "pendiente").toLowerCase();
        const prioridad = (r.prioridad || "media").toLowerCase();
        const fecha     = new Date(r.fecha).toLocaleDateString("es-AR");
        const idCorto   = String(r.id).slice(0, 6);

        const estadoClass    = estado === "resuelto" ? "estado-ok" : estado.includes("rev") ? "estado-review" : "estado-pendiente";
        const prioridadClass = prioridad === "alta" ? "prioridad-alta" : prioridad === "media" ? "prioridad-media" : "prioridad-baja";

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
              ${r.zona ? `<p class="fecha-label">📍 ${r.zona}</p>` : ""}
              ${r.descripcion ? `<p class="desc-label">${r.descripcion}</p>` : ""}
            </div>
            <div class="reporte-acciones">
              <select onchange="cambiarEstado(${r.id}, this.value)">
                <option value="pendiente"   ${estado === "pendiente"   ? "selected" : ""}>Pendiente</option>
                <option value="en revision" ${estado === "en revision" ? "selected" : ""}>En revisión</option>
                <option value="resuelto"    ${estado === "resuelto"    ? "selected" : ""}>Resuelto</option>
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
  kpiTotal.textContent  = reportes.length;
  kpiOk.textContent     = reportes.filter(r => r.estado === "resuelto").length;
  kpiReview.textContent = reportes.filter(r => (r.estado || "").includes("rev")).length;
  kpiHigh.textContent   = reportes.filter(r => r.prioridad === "alta").length;
}

/* =======================================================
   CHARTS
======================================================= */
function actualizarCharts(reportes) {
  const estados = { pendiente: 0, revision: 0, resuelto: 0 };
  const zonas   = {};

  reportes.forEach(r => {
    const est = (r.estado || "pendiente").toLowerCase();
    if (est === "resuelto")       estados.resuelto++;
    else if (est.includes("rev")) estados.revision++;
    else                          estados.pendiente++;

    const zona = r.zona || "Sin zona";
    zonas[zona] = (zonas[zona] || 0) + 1;
  });

  if (CHART_ESTADOS) CHART_ESTADOS.destroy();
  if (CHART_ZONA)    CHART_ZONA.destroy();

  CHART_ESTADOS = new Chart(ctxEstado, {
    type: "doughnut",
    data: {
      labels: ["Pendiente", "En revisión", "Resuelto"],
      datasets: [{ data: [estados.pendiente, estados.revision, estados.resuelto], backgroundColor: ["#3b82f6", "#ec4899", "#f97316"] }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  CHART_ZONA = new Chart(ctxZona, {
    type: "bar",
    data: {
      labels: Object.keys(zonas),
      datasets: [{ label: "Reportes", data: Object.values(zonas), backgroundColor: "#3b82f6" }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}

/* =======================================================
   EXPORTAR PDF
======================================================= */
document.getElementById("btnExportarPDF")?.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc   = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const reportes = REPORTES_FILTRADOS.length ? REPORTES_FILTRADOS : REPORTES_ORIGINALES;

  doc.setFillColor(13, 110, 253);
  doc.rect(0, 0, pageW, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("CityRepair — Panel EDET", 14, 14);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const fecha = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });
  doc.text(`Exportado el ${fecha}  ·  ${reportes.length} reportes`, 14, 24);

  let y = 44;
  doc.setFillColor(240, 244, 255);
  doc.rect(10, y - 6, pageW - 20, 10, "F");
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("#", 14, y); doc.text("TIPO", 30, y); doc.text("ZONA", 90, y);
  doc.text("ESTADO", 130, y); doc.text("PRIORIDAD", 165, y); doc.text("FECHA", 190, y);
  y += 8;

  reportes.forEach((r, i) => {
    if (y > pageH - 20) {
      doc.addPage();
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
      doc.text("#", 14, y); doc.text("TIPO", 30, y); doc.text("ZONA", 90, y);
      doc.text("ESTADO", 130, y); doc.text("PRIORIDAD", 165, y); doc.text("FECHA", 190, y);
      y += 8;
    }

    if (i % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(10, y - 5, pageW - 20, 9, "F"); }

    const estado    = (r.estado    || "pendiente").toLowerCase();
    const prioridad = (r.prioridad || "media").toLowerCase();

    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); doc.text(`${i + 1}`, 14, y);
    doc.setTextColor(17, 24, 39);   doc.text((r.tipo || "Sin tipo").slice(0, 22), 30, y);
    doc.text((r.zona || "—").slice(0, 20), 90, y);

    if (estado === "resuelto")       doc.setTextColor(22, 163, 74);
    else if (estado.includes("rev")) doc.setTextColor(217, 119, 6);
    else                             doc.setTextColor(59, 130, 246);
    doc.setFont("helvetica", "bold"); doc.text(estado, 130, y);

    if (prioridad === "alta")        doc.setTextColor(220, 38, 38);
    else if (prioridad === "media")  doc.setTextColor(180, 100, 0);
    else                             doc.setTextColor(22, 163, 74);
    doc.text(prioridad, 165, y);

    doc.setTextColor(107, 114, 128); doc.setFont("helvetica", "normal");
    doc.text(new Date(r.fecha).toLocaleDateString("es-AR"), 190, y);
    y += 10;
  });

  // Pie de página con número en TODAS las páginas
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPaginas; p++) {
    doc.setPage(p);
    doc.setFillColor(13, 110, 253);
    doc.rect(0, pageH - 12, pageW, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("CityRepair © 2025 — Documento generado automáticamente", 14, pageH - 4);
    doc.text(`Página ${p} de ${totalPaginas}`, pageW - 14, pageH - 4, { align: "right" });
  }

  doc.save(`reportes-edet.pdf`);
});

/* =======================================================
   LOGOUT
======================================================= */
function cerrarSesion() {
  localStorage.removeItem("cr_auth");
  window.location.href = "./login.html";
}
window.cerrarSesion = cerrarSesion;