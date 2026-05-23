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

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(48);
  doc.setFont("helvetica", "bold");
  doc.text("⚡", 24, pageH / 2 - 45);

  doc.setFontSize(36);
  doc.text("CityRepair", 24, pageH / 2 - 10);

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
  doc.text("⚡ CityRepair — Análisis Visual", 14, 14);
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
    doc.text("⚡ CityRepair — Listado de Reportes", 14, 14);
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