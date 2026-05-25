const LOGO_B64 = "data:image/png;base64,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";

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
   EXPORTAR PDF (con portada + gráficos + tabla)
======================================================= */
document.getElementById("btnExportarPDF")?.addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const doc   = new jsPDF({ orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const reportes = REPORTES_FILTRADOS.length ? REPORTES_FILTRADOS : REPORTES_ORIGINALES;
  const fechaHoy = new Date().toLocaleDateString("es-AR", {
    day: "2-digit", month: "long", year: "numeric"
  });

  // ── PORTADA ──────────────────────────────────────────
  doc.setFillColor(13, 110, 253);
  doc.rect(0, 0, pageW, pageH, "F");

  doc.setFillColor(7, 60, 150);
  doc.rect(0, pageH - 40, pageW, 40, "F");

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.circle(pageW - 60, 40, 60);
  doc.circle(pageW - 60, 40, 45);

  // Logo del proyecto
  doc.addImage(LOGO_B64, "PNG", 24, pageH / 2 - 60, 20, 20);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("CityRepair", 48, pageH / 2 - 45);

  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 220, 255);
  doc.text("Panel de Gestión EDET — Reporte de Incidencias", 24, pageH / 2 + 10);

  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(20, pageH / 2 + 20, pageW - 20, pageH / 2 + 20);

  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${fechaHoy}`, 24, pageH / 2 + 35);
  doc.text(`Total reportes: ${reportes.length}`, 24, pageH / 2 + 48);
  doc.text(`Resueltos: ${reportes.filter(r => r.estado === "resuelto").length}`, 24, pageH / 2 + 61);
  doc.text(`Pendientes: ${reportes.filter(r => (r.estado||"") === "pendiente").length}`, 24, pageH / 2 + 74);

  doc.setFontSize(9);
  doc.setTextColor(180, 200, 255);
  doc.text("Documento generado automáticamente por CityRepair © 2025", pageW / 2, pageH - 15, { align: "center" });

  // ── PÁGINA DE GRÁFICOS ───────────────────────────────
  doc.addPage();

  doc.setFillColor(13, 110, 253);
  doc.rect(0, 0, pageW, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.addImage(LOGO_B64, "PNG", 14, 4, 12, 12);
  doc.text("CityRepair — Análisis Visual", 29, 14);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(`${reportes.length} reportes`, pageW - 14, 14, { align: "right" });

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Estado de Reportes", 14, 35);

  const canvasEstado = document.getElementById("chartStatus");
  if (canvasEstado) {
    doc.addImage(canvasEstado.toDataURL("image/png"), "PNG", 14, 40, 120, 90);
  }

  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(17, 24, 39);
  doc.text("Reportes por Zona", 148, 35);

  const canvasZona = document.getElementById("chartZones");
  if (canvasZona) {
    doc.addImage(canvasZona.toDataURL("image/png"), "PNG", 148, 40, 130, 90);
  }

  // Mini resumen debajo
  const resY = 145;
  doc.setFillColor(240, 244, 255);
  doc.rect(14, resY, pageW - 28, 9, "F");
  doc.setTextColor(30, 64, 175);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("RESUMEN", 18, resY + 6);

  const items = [
    ["Total", reportes.length],
    ["Resueltos", reportes.filter(r => r.estado === "resuelto").length],
    ["Pendientes", reportes.filter(r => (r.estado||"") === "pendiente").length],
    ["Alta prioridad", reportes.filter(r => (r.prioridad||"").toLowerCase() === "alta").length],
  ];
  let rx = 55;
  items.forEach(([label, val]) => {
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text(label + ":", rx, resY + 6);
    doc.setTextColor(17, 24, 39);
    doc.setFont("helvetica", "bold");
    doc.text(String(val), rx + 26, resY + 6);
    rx += 50;
  });

  doc.setFillColor(13, 110, 253);
  doc.rect(0, pageH - 12, pageW, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("CityRepair © 2025", 14, pageH - 4);
  doc.text("Página 1 de " + Math.ceil(reportes.length / 25 + 1), pageW - 14, pageH - 4, { align: "right" });

  // ── PÁGINAS DE DATOS ─────────────────────────────────
  doc.addPage();

  const drawHeader = () => {
    doc.setFillColor(13, 110, 253);
    doc.rect(0, 0, pageW, 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.addImage(LOGO_B64, "PNG", 14, 4, 12, 12);
  doc.text("CityRepair — Listado de Reportes", 29, 14);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(`Exportado el ${fechaHoy}`, pageW - 14, 14, { align: "right" });
  };

  const drawColHeaders = (y) => {
    doc.setFillColor(240, 244, 255);
    doc.rect(10, y - 6, pageW - 20, 10, "F");
    doc.setTextColor(30, 64, 175);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.text("#",         14, y);
    doc.text("TIPO",      30, y);
    doc.text("ZONA",      90, y);
    doc.text("ESTADO",   155, y);
    doc.text("PRIORIDAD",195, y);
    doc.text("FECHA",    240, y);
  };

  drawHeader();
  let y = 38;
  drawColHeaders(y);
  y += 8;

  reportes.forEach((r, i) => {
    if (y > pageH - 20) {
      const p = doc.internal.getCurrentPageInfo().pageNumber;
      doc.setFillColor(13, 110, 253);
      doc.rect(0, pageH - 12, pageW, 12, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("CityRepair © 2025", 14, pageH - 4);
      doc.text(`Página ${p - 1}`, pageW - 14, pageH - 4, { align: "right" });

      doc.addPage();
      drawHeader();
      y = 38;
      drawColHeaders(y);
      y += 8;
    }

    if (i % 2 === 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(10, y - 5, pageW - 20, 9, "F");
    }

    const estado    = (r.estado    || "PENDIENTE").toUpperCase();
    const prioridad = (r.prioridad || "MEDIA").toUpperCase();

    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`${i + 1}`, 14, y);

    doc.setTextColor(17, 24, 39);
    doc.text((r.tipo || "Sin tipo").slice(0, 28), 30, y);
    doc.text((r.zona || "—").slice(0, 28), 90, y);

    if (estado === "RESUELTO")           doc.setTextColor(22, 163, 74);
    else if (estado.includes("REV"))     doc.setTextColor(217, 119, 6);
    else                                 doc.setTextColor(59, 130, 246);
    doc.setFont("helvetica", "bold");
    doc.text(estado, 155, y);

    if (prioridad === "ALTA")            doc.setTextColor(220, 38, 38);
    else if (prioridad === "MEDIA")      doc.setTextColor(180, 100, 0);
    else                                 doc.setTextColor(22, 163, 74);
    doc.text(prioridad, 195, y);

    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text(new Date(r.fecha).toLocaleDateString("es-AR"), 240, y);

    y += 10;
  });

  // Pie en todas las páginas de datos
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 3; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(13, 110, 253);
    doc.rect(0, pageH - 12, pageW, 12, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text("CityRepair © 2025 — Documento generado automáticamente", 14, pageH - 4);
    doc.text(`Página ${p - 1} de ${totalPages - 1}`, pageW - 14, pageH - 4, { align: "right" });
  }

  doc.save("reportes-edet.pdf");
});

/* =======================================================
   LOGOUT
======================================================= */
function cerrarSesion() {
  localStorage.removeItem("cr_auth");
  window.location.href = "./login.html";
}
window.cerrarSesion = cerrarSesion;