const LOGO_B64 = "data:image/png;base64,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"; // se reemplazará con el logo real
const API = "http://localhost:3000/api";
const POR_PAGINA = 10;

/* =======================================================
   ELEMENTOS
======================================================= */
const contenedor        = document.getElementById("edet-reportes-container");
const paginadoEl        = document.getElementById("paginado-container");
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
const ctxTipos          = document.getElementById("chartTipos");
const ctxPrioridad      = document.getElementById("chartPrioridad");

let REPORTES_ORIGINALES = [];
let REPORTES_FILTRADOS  = [];
let CHART_ESTADOS       = null;
let CHART_ZONA          = null;
let CHART_TIPOS         = null;
let CHART_PRIORIDAD     = null;
let paginaActual        = 1;

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
  // Base: solo mostrar reportes sin técnico asignado O ya resueltos
  // Los "en revisión" con técnico asignado van al dashboard del técnico
  let filtrados = REPORTES_ORIGINALES.filter(r =>
    !r.tecnico_email || r.estado === "resuelto"
  );

  const resolucion = filtroResolucion?.value || "todos";
  const prioridad  = filtroPrioridad?.value  || "todos";
  const tipo       = filtroTipo?.value       || "todos";
  const zona       = filtroZona?.value       || "todos";
  const desde      = fechaDesde?.value       || "";
  const hasta      = fechaHasta?.value       || "";

  if (resolucion === "resuelto")     filtrados = filtrados.filter(r => r.estado === "resuelto");
  if (resolucion === "no_resuelto")  filtrados = filtrados.filter(r => r.estado !== "resuelto");
  if (prioridad !== "todos")         filtrados = filtrados.filter(r => (r.prioridad || "").toLowerCase() === prioridad);
  if (tipo !== "todos")              filtrados = filtrados.filter(r => (r.tipo || "").toLowerCase() === tipo);
  if (zona !== "todos")              filtrados = filtrados.filter(r => (r.zona || "") === zona);
  if (desde) filtrados = filtrados.filter(r => new Date(r.fecha) >= new Date(desde));
  if (hasta) filtrados = filtrados.filter(r => new Date(r.fecha) <= new Date(hasta));

  REPORTES_FILTRADOS = filtrados;
  paginaActual = 1;
  actualizarKPIs(filtrados);
  actualizarCharts(filtrados);
  renderPagina();
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
   PAGINADO
======================================================= */
function renderPagina() {
  const total  = REPORTES_FILTRADOS.length;
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const fin    = inicio + POR_PAGINA;
  const pagina = REPORTES_FILTRADOS.slice(inicio, fin);

  renderTabla(pagina);
  renderPaginado(total);
}

function renderPaginado(total) {
  if (!paginadoEl) return;
  const totalPaginas = Math.ceil(total / POR_PAGINA);
  if (totalPaginas <= 1) { paginadoEl.innerHTML = ""; return; }

  let html = "";

  // Botón Anterior
  html += `<button class="prev-next" onclick="irPagina(${paginaActual - 1})" ${paginaActual === 1 ? "disabled" : ""}>← Anterior</button>`;

  // Números de página
  for (let i = 1; i <= totalPaginas; i++) {
    if (
      i === 1 || i === totalPaginas ||
      (i >= paginaActual - 2 && i <= paginaActual + 2)
    ) {
      html += `<button class="${i === paginaActual ? "activa" : ""}" onclick="irPagina(${i})">${i}</button>`;
    } else if (i === paginaActual - 3 || i === paginaActual + 3) {
      html += `<button disabled>...</button>`;
    }
  }

  // Botón Siguiente
  html += `<button class="prev-next" onclick="irPagina(${paginaActual + 1})" ${paginaActual === totalPaginas ? "disabled" : ""}>Siguiente →</button>`;

  paginadoEl.innerHTML = html;
}

function irPagina(n) {
  const totalPaginas = Math.ceil(REPORTES_FILTRADOS.length / POR_PAGINA);
  if (n < 1 || n > totalPaginas) return;
  paginaActual = n;
  renderPagina();
  document.querySelector(".card:last-of-type")?.scrollIntoView({ behavior: "smooth" });
}
window.irPagina = irPagina;

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
              <button class="btn-asignar" onclick="abrirModalAsignar(${r.id})">👷 Asignar técnico</button>
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
  // ── Estado ──
  const estados = { pendiente: 0, revision: 0, resuelto: 0 };
  reportes.forEach(r => {
    const est = (r.estado || "pendiente").toLowerCase();
    if (est === "resuelto")       estados.resuelto++;
    else if (est.includes("rev")) estados.revision++;
    else                          estados.pendiente++;
  });

  // ── Zonas ──
  const zonas = {};
  reportes.forEach(r => {
    const zona = r.zona || "Sin zona";
    zonas[zona] = (zonas[zona] || 0) + 1;
  });

  // ── Tipos ──
  const tipos = {};
  reportes.forEach(r => {
    const tipo = r.tipo || "otros";
    tipos[tipo] = (tipos[tipo] || 0) + 1;
  });

  // ── Prioridades ──
  const prioridades = { alta: 0, media: 0, baja: 0 };
  reportes.forEach(r => {
    const p = (r.prioridad || "media").toLowerCase();
    if (p === "alta")      prioridades.alta++;
    else if (p === "baja") prioridades.baja++;
    else                   prioridades.media++;
  });

  if (CHART_ESTADOS)   CHART_ESTADOS.destroy();
  if (CHART_ZONA)      CHART_ZONA.destroy();
  if (CHART_TIPOS)     CHART_TIPOS.destroy();
  if (CHART_PRIORIDAD) CHART_PRIORIDAD.destroy();

  CHART_ESTADOS = new Chart(ctxEstado, {
    type: "doughnut",
    data: {
      labels: ["Pendiente", "En revisión", "Resuelto"],
      datasets: [{ data: [estados.pendiente, estados.revision, estados.resuelto], backgroundColor: ["#3b82f6", "#ec4899", "#f97316"] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "top" } } }
  });

  CHART_ZONA = new Chart(ctxZona, {
    type: "bar",
    data: {
      labels: Object.keys(zonas),
      datasets: [{ label: "Reportes", data: Object.values(zonas), backgroundColor: "#3b82f6" }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
  });

  CHART_TIPOS = new Chart(ctxTipos, {
    type: "bar",
    data: {
      labels: Object.keys(tipos),
      datasets: [{ label: "Cantidad", data: Object.values(tipos), backgroundColor: "#6366f1" }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, indexAxis: "y",
      plugins: { legend: { display: false } }
    }
  });

  CHART_PRIORIDAD = new Chart(ctxPrioridad, {
    type: "doughnut",
    data: {
      labels: ["Alta", "Media", "Baja"],
      datasets: [{ data: [prioridades.alta, prioridades.media, prioridades.baja], backgroundColor: ["#dc2626", "#f59e0b", "#16a34a"] }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "top" } } }
  });
}

/* =======================================================
   EXPORTAR PDF
======================================================= */
document.getElementById("btnExportarPDF")?.addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const doc   = new jsPDF({ orientation: "landscape" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const reportes = REPORTES_FILTRADOS.length ? REPORTES_FILTRADOS : REPORTES_ORIGINALES;
  const fechaHoy = new Date().toLocaleDateString("es-AR", { day: "2-digit", month: "long", year: "numeric" });

  // ── PORTADA ──
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, pageH, "F");
  doc.setFillColor(15, 23, 42);
  doc.rect(0, pageH - 40, pageW, 40, "F");
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.circle(pageW - 60, 40, 60);
  doc.circle(pageW - 60, 40, 45);

  // Logo en portada
  doc.addImage(LOGO_B64, "PNG", 24, pageH / 2 - 60, 20, 20);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(36);
  doc.setFont("helvetica", "bold");
  doc.text("CityRepair", 50, pageH / 2 - 45);
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 220, 255);
  doc.text("Panel de Gestión EDET — Reporte de Incidencias", 24, pageH / 2 + 10);
  doc.setDrawColor(255, 255, 255);
  doc.line(20, pageH / 2 + 20, pageW - 20, pageH / 2 + 20);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`Fecha: ${fechaHoy}`, 24, pageH / 2 + 35);
  doc.text(`Total reportes: ${reportes.length}`, 24, pageH / 2 + 48);
  doc.text(`Resueltos: ${reportes.filter(r => r.estado === "resuelto").length}`, 24, pageH / 2 + 61);
  doc.text(`Pendientes: ${reportes.filter(r => (r.estado||"") === "pendiente").length}`, 24, pageH / 2 + 74);
  doc.setFontSize(9);
  doc.setTextColor(180, 200, 255);
  doc.text("Documento generado automáticamente por CityRepair © 2025", pageW / 2, pageH - 15, { align: "center" });

  // ── PÁGINA GRÁFICOS ──
  doc.addPage();
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageW, 22, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11); doc.setFont("helvetica", "bold");
  doc.addImage(LOGO_B64, "PNG", 14, 5, 12, 12);
  doc.text("CityRepair — Análisis Visual", 29, 14);
  doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text(`${reportes.length} reportes`, pageW - 14, 14, { align: "right" });

  doc.setTextColor(17, 24, 39);
  doc.setFontSize(10); doc.setFont("helvetica", "bold");
  doc.text("Estado de Reportes", 14, 32);
  const canvasEstado = document.getElementById("chartStatus");
  if (canvasEstado) doc.addImage(canvasEstado.toDataURL("image/png"), "PNG", 14, 36, 90, 70);

  doc.text("Reportes por Zona", 112, 32);
  const canvasZona = document.getElementById("chartZones");
  if (canvasZona) doc.addImage(canvasZona.toDataURL("image/png"), "PNG", 112, 36, 90, 70);

  doc.text("Tipos de Problema", 14, 115);
  const canvasTipos = document.getElementById("chartTipos");
  if (canvasTipos) doc.addImage(canvasTipos.toDataURL("image/png"), "PNG", 14, 119, 90, 70);

  doc.text("Reportes por Prioridad", 112, 115);
  const canvasPrioridad = document.getElementById("chartPrioridad");
  if (canvasPrioridad) doc.addImage(canvasPrioridad.toDataURL("image/png"), "PNG", 112, 119, 90, 70);

  // Resumen
  const resY = 196;
  doc.setFillColor(240, 244, 255);
  doc.rect(14, resY, pageW - 28, 9, "F");
  doc.setTextColor(30, 64, 175); doc.setFontSize(8); doc.setFont("helvetica", "bold");
  doc.text("RESUMEN", 18, resY + 6);
  const items = [
    ["Total", reportes.length],
    ["Resueltos", reportes.filter(r => r.estado === "resuelto").length],
    ["Pendientes", reportes.filter(r => (r.estado||"") === "pendiente").length],
    ["Alta prioridad", reportes.filter(r => (r.prioridad||"").toLowerCase() === "alta").length],
  ];
  let rx = 55;
  items.forEach(([label, val]) => {
    doc.setTextColor(107, 114, 128); doc.setFont("helvetica", "normal");
    doc.text(label + ":", rx, resY + 6);
    doc.setTextColor(17, 24, 39); doc.setFont("helvetica", "bold");
    doc.text(String(val), rx + 26, resY + 6);
    rx += 50;
  });

  doc.setFillColor(30, 41, 59);
  doc.rect(0, pageH - 12, pageW, 12, "F");
  doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "normal");
  doc.text("CityRepair © 2025", 14, pageH - 4);

  // ── PÁGINAS DATOS ──
  doc.addPage();

  const drawHeader = () => {
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, pageW, 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11); doc.setFont("helvetica", "bold");
    doc.addImage(LOGO_B64, "PNG", 14, 5, 12, 12);
  doc.text("CityRepair — Listado de Reportes", 29, 14);
    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text(`Exportado el ${fechaHoy}`, pageW - 14, 14, { align: "right" });
  };

  const drawColHeaders = (y) => {
    doc.setFillColor(240, 244, 255);
    doc.rect(10, y - 6, pageW - 20, 10, "F");
    doc.setTextColor(30, 64, 175); doc.setFontSize(8); doc.setFont("helvetica", "bold");
    doc.text("#", 14, y); doc.text("TIPO", 30, y); doc.text("ZONA", 90, y);
    doc.text("ESTADO", 155, y); doc.text("PRIORIDAD", 195, y); doc.text("FECHA", 240, y);
  };

  drawHeader();
  let y = 38;
  drawColHeaders(y);
  y += 8;

  reportes.forEach((r, i) => {
    if (y > pageH - 20) {
      doc.setFillColor(30, 41, 59);
      doc.rect(0, pageH - 12, pageW, 12, "F");
      doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "normal");
      doc.text("CityRepair © 2025", 14, pageH - 4);
      doc.addPage(); drawHeader(); y = 38; drawColHeaders(y); y += 8;
    }
    if (i % 2 === 0) { doc.setFillColor(249, 250, 251); doc.rect(10, y - 5, pageW - 20, 9, "F"); }

    const estado    = (r.estado    || "PENDIENTE").toUpperCase();
    const prioridad = (r.prioridad || "MEDIA").toUpperCase();

    doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); doc.text(`${i + 1}`, 14, y);
    doc.setTextColor(17, 24, 39); doc.text((r.tipo || "Sin tipo").slice(0, 28), 30, y);
    doc.text((r.zona || "—").slice(0, 28), 90, y);

    if (estado === "RESUELTO")           doc.setTextColor(22, 163, 74);
    else if (estado.includes("REV"))     doc.setTextColor(217, 119, 6);
    else                                 doc.setTextColor(59, 130, 246);
    doc.setFont("helvetica", "bold"); doc.text(estado, 155, y);

    if (prioridad === "ALTA")            doc.setTextColor(220, 38, 38);
    else if (prioridad === "MEDIA")      doc.setTextColor(180, 100, 0);
    else                                 doc.setTextColor(22, 163, 74);
    doc.text(prioridad, 195, y);

    doc.setTextColor(107, 114, 128); doc.setFont("helvetica", "normal");
    doc.text(new Date(r.fecha).toLocaleDateString("es-AR"), 240, y);
    y += 10;
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 3; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(30, 41, 59);
    doc.rect(0, pageH - 12, pageW, 12, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont("helvetica", "normal");
    doc.text("CityRepair © 2025 — Documento generado automáticamente", 14, pageH - 4);
    doc.text(`Página ${p - 1} de ${totalPages - 1}`, pageW - 14, pageH - 4, { align: "right" });
  }

  doc.save("reportes-edet.pdf");
});

/* =======================================================
   MODAL ASIGNAR TÉCNICO
======================================================= */

// Crear modal al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.createElement("div");
  modal.id = "modal-asignar";
  modal.style.cssText = `
    display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5);
    z-index:1000; align-items:center; justify-content:center;
  `;
  modal.innerHTML = `
    <div style="background:#fff; border-radius:16px; padding:28px; width:360px; box-shadow:0 8px 32px rgba(0,0,0,0.2);">
      <h3 style="margin:0 0 16px; font-family:'DM Sans',sans-serif; font-size:1.1rem; color:#111827;">👷 Asignar Técnico</h3>
      <label style="font-size:0.82rem; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:.04em;">Seleccioná un técnico</label>
      <select id="select-tecnico" style="width:100%; margin-top:6px; margin-bottom:16px; height:40px; padding:0 12px; border-radius:10px; border:1.5px solid #e5e7eb; font-family:'DM Sans',sans-serif; font-size:0.9rem;">
        <option value="">Cargando técnicos...</option>
      </select>
      <div style="display:flex; gap:10px;">
        <button onclick="confirmarAsignar()" style="flex:1; height:40px; background:#0d6efd; color:#fff; border:none; border-radius:10px; font-family:'DM Sans',sans-serif; font-weight:600; cursor:pointer;">Asignar</button>
        <button onclick="cerrarModal()" style="flex:1; height:40px; background:#fff; color:#374151; border:1.5px solid #e5e7eb; border-radius:10px; font-family:'DM Sans',sans-serif; font-weight:600; cursor:pointer;">Cancelar</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  cargarTecnicos();
});

let reporteIdSeleccionado = null;

async function cargarTecnicos() {
  try {
    const res  = await fetch(`${API}/tecnicos`);
    const data = await res.json();
    const sel  = document.getElementById("select-tecnico");
    if (!sel) return;
    if (data.length === 0) {
      sel.innerHTML = `<option value="">No hay técnicos disponibles</option>`;
      return;
    }
    sel.innerHTML = data.map(t => `<option value="${t.email}">${t.email}</option>`).join("");
  } catch (err) {
    console.error("Error cargando técnicos:", err);
  }
}

function abrirModalAsignar(reporteId) {
  reporteIdSeleccionado = reporteId;
  const modal = document.getElementById("modal-asignar");
  if (modal) modal.style.display = "flex";
}
window.abrirModalAsignar = abrirModalAsignar;

function cerrarModal() {
  const modal = document.getElementById("modal-asignar");
  if (modal) modal.style.display = "none";
  reporteIdSeleccionado = null;
}
window.cerrarModal = cerrarModal;

async function confirmarAsignar() {
  const tecnico = document.getElementById("select-tecnico")?.value;
  if (!tecnico) { alert("Seleccioná un técnico"); return; }

  try {
    const res = await fetch(`${API}/reportes/${reporteIdSeleccionado}/asignar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tecnico_email: tecnico })
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Error del servidor (${res.status})`);
    }

    // También cambiar estado a "en revision"
    await fetch(`${API}/reportes/${reporteIdSeleccionado}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "en revision" })
    });

    const reporte = REPORTES_ORIGINALES.find(r => r.id == reporteIdSeleccionado);
    if (reporte) {
      reporte.tecnico_email = tecnico;
      reporte.estado = "en revision";
    }

    cerrarModal();
    aplicarFiltros();
    alert(`✅ Reporte asignado a ${tecnico}`);
  } catch (err) {
    alert(`❌ Error al asignar técnico: ${err.message}`);
  }
}
window.confirmarAsignar = confirmarAsignar;

/* =======================================================
   LOGOUT
======================================================= */
function cerrarSesion() {
  localStorage.removeItem("cr_auth");
  window.location.href = "./login.html";
}
window.cerrarSesion = cerrarSesion;