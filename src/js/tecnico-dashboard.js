const API      = "http://localhost:3000/api";
const POR_PAGINA_TEC = 5;
let paginaActualTec  = 1;
let reportesFiltradosTec = [];

const listaEl      = document.getElementById("lista-tecnico");
const kpiAsignados = document.getElementById("kpiAsignados");
const kpiRevision  = document.getElementById("kpiRevision");
const kpiResueltos = document.getElementById("kpiResueltos");

const filtroEstadoEl   = document.getElementById("filtro-estado-tec");
const filtroPrioEl     = document.getElementById("filtro-prioridad-tec");
const fechaDesdeEl     = document.getElementById("fecha-desde-tec");
const fechaHastaEl     = document.getElementById("fecha-hasta-tec");
const btnAplicar       = document.getElementById("btn-aplicar-tec");
const btnLimpiar       = document.getElementById("btn-limpiar-tec");

let reportesTecnico = [];
let emailTecnico    = "";

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const session = JSON.parse(localStorage.getItem("cr_auth"));
  if (!session || session.role !== "tecnico") {
    window.location.href = "./login.html";
    return;
  }
  emailTecnico = session.email;
  cargarReportes();
});

/* =========================
   CARGAR DESDE BACKEND
========================= */
async function cargarReportes() {
  try {
    const res  = await fetch(`${API}/reportes/tecnico/${encodeURIComponent(emailTecnico)}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Error del servidor (${res.status})`);
    }

    if (!Array.isArray(data)) {
      throw new Error("La respuesta del servidor no es válida");
    }

    reportesTecnico = data.map(r => ({ ...r, fecha: new Date(r.fecha) }));
    aplicarFiltros();
  } catch (err) {
    console.error("Error:", err);
    if (listaEl) listaEl.innerHTML = `<p style="color:#dc2626; padding:16px;">Error cargando reportes: ${err.message}</p>`;
  }
}

/* =========================
   FILTROS
========================= */
function aplicarFiltros() {
  // Solo mostrar reportes NO resueltos (los resueltos vuelven al EDET admin)
  let lista = reportesTecnico.filter(r => r.estado !== "resuelto");

  const estado = filtroEstadoEl?.value || "todos";
  const prio   = filtroPrioEl?.value   || "todos";
  const desde  = fechaDesdeEl?.value   || "";
  const hasta  = fechaHastaEl?.value   || "";
  const tipo   = document.getElementById("filtro-tipo-tec")?.value || "";
  const zona   = document.getElementById("filtro-zona-tec")?.value || "";

  if (estado !== "todos") {
    lista = lista.filter(r => {
      const est = (r.estado || "pendiente").toLowerCase();
      if (estado === "en revision") return est.includes("rev");
      return est === estado;
    });
  }
  if (prio  !== "todos") lista = lista.filter(r => (r.prioridad || "").toLowerCase() === prio);
  if (desde)             lista = lista.filter(r => new Date(r.fecha) >= new Date(desde));
  if (hasta)             lista = lista.filter(r => new Date(r.fecha) <= new Date(hasta));
  if (tipo)              lista = lista.filter(r => (r.tipo || "").toLowerCase().includes(tipo));
  if (zona)              lista = lista.filter(r => (r.zona || "") === zona);

  actualizarKPIs(lista);
  reportesFiltradosTec = lista;
  paginaActualTec = 1;
  renderPaginaTec();
}

btnAplicar?.addEventListener("click", aplicarFiltros);
btnLimpiar?.addEventListener("click", () => {
  if (filtroEstadoEl) filtroEstadoEl.value = "todos";
  if (filtroPrioEl)   filtroPrioEl.value   = "todos";
  if (fechaDesdeEl)   fechaDesdeEl.value   = "";
  if (fechaHastaEl)   fechaHastaEl.value   = "";
  aplicarFiltros();
});
filtroEstadoEl?.addEventListener("change", aplicarFiltros);
filtroPrioEl?.addEventListener("change", aplicarFiltros);

/* =========================
   KPIs
========================= */
function actualizarKPIs(lista) {
  const hoy = new Date().toDateString();
  if (kpiAsignados) kpiAsignados.textContent = reportesTecnico.length;
  if (kpiRevision)  kpiRevision.textContent  = reportesTecnico.filter(r => (r.estado||"").includes("rev")).length;
  if (kpiResueltos) kpiResueltos.textContent = reportesTecnico.filter(r => {
    return r.estado === "resuelto" && new Date(r.fecha).toDateString() === hoy;
  }).length;
}

/* =========================
   PAGINACIÓN TÉCNICO
========================= */
function renderPaginaTec() {
  const inicio = (paginaActualTec - 1) * POR_PAGINA_TEC;
  const fin    = inicio + POR_PAGINA_TEC;
  renderReportes(reportesFiltradosTec.slice(inicio, fin));
  renderPaginadoTec(reportesFiltradosTec.length);
}

function renderPaginadoTec(total) {
  const el = document.getElementById("paginado-tecnico");
  if (!el) return;
  const MINIMO = 5;
  const totalPaginas = Math.ceil(total / POR_PAGINA_TEC);
  const sinDatos = total < MINIMO;

  if (sinDatos) {
    el.innerHTML = `
      <button class="prev-next" disabled>← Anterior</button>
      <button class="activa" disabled>1</button>
      <button class="prev-next" disabled>Siguiente →</button>
      <span class="pag-hint">Disponible desde 5 reportes</span>`;
    return;
  }

  if (totalPaginas <= 1) {
    el.innerHTML = `
      <button class="prev-next" disabled>← Anterior</button>
      <button class="activa">1</button>
      <button class="prev-next" disabled>Siguiente →</button>`;
    return;
  }

  let html = `<button class="prev-next" onclick="irPaginaTec(${paginaActualTec - 1})" ${paginaActualTec === 1 ? "disabled" : ""}>← Anterior</button>`;
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || (i >= paginaActualTec - 2 && i <= paginaActualTec + 2)) {
      html += `<button class="${i === paginaActualTec ? "activa" : ""}" onclick="irPaginaTec(${i})">${i}</button>`;
    } else if (i === paginaActualTec - 3 || i === paginaActualTec + 3) {
      html += `<button disabled>...</button>`;
    }
  }
  html += `<button class="prev-next" onclick="irPaginaTec(${paginaActualTec + 1})" ${paginaActualTec === totalPaginas ? "disabled" : ""}>Siguiente →</button>`;
  el.innerHTML = html;
}

function irPaginaTec(n) {
  const totalPaginas = Math.ceil(reportesFiltradosTec.length / POR_PAGINA_TEC);
  if (n < 1 || n > totalPaginas) return;
  paginaActualTec = n;
  renderPaginaTec();
  document.getElementById("lista-tecnico")?.scrollIntoView({ behavior: "smooth" });
}
window.irPaginaTec = irPaginaTec;

/* =========================
   RENDER
========================= */
function renderReportes(reportes) {
  if (!listaEl) return;

  if (reportes.length === 0) {
    listaEl.innerHTML = `
      <div class="tec-empty-state">
        <div class="tec-empty-icon">🎉</div>
        <h3>¡Sin pendientes!</h3>
        <p>No tenés reportes activos asignados en este momento.</p>
      </div>`;
    return;
  }

  const prioConfig = {
    alta:  { bg: "#fee2e2", color: "#b91c1c", dot: "#ef4444" },
    media: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
    baja:  { bg: "#dcfce7", color: "#166534", dot: "#22c55e" },
  };

  const stateConfig = {
    "en revision": { bg: "#fef3c7", color: "#92400e", border: "#f59e0b", icon: "🔄" },
    "pendiente":   { bg: "#dbeafe", color: "#003087", border: "#3b82f6", icon: "📋" },
  };

  const typeIcons = {
    "corte": "⚡", "baja": "🔌", "transformador": "🔧",
    "luminaria": "💡", "cable": "🔗", "medidor": "⚙️", "poste": "🪝"
  };

  listaEl.innerHTML = reportes.map(r => {
    const estado    = (r.estado || "pendiente").toLowerCase();
    const prioridad = (r.prioridad || "baja").toLowerCase();
    const fecha     = new Date(r.fecha).toLocaleDateString("es-AR", {
      day: "2-digit", month: "short", year: "numeric"
    });

    const prio     = prioConfig[prioridad] || prioConfig.baja;
    const state    = stateConfig[estado]   || stateConfig.pendiente;
    const tipoKey  = Object.keys(typeIcons).find(k => (r.tipo || "").toLowerCase().includes(k));
    const icon     = typeIcons[tipoKey] || "🛠️";
    const enRevision = estado === "en revision";

    // Botones — siempre blanco + borde de color
    const btnRevision = `
      <button onclick="abrirModalRevision(${r.id})" class="tec-btn-revision">
        🔄 En revisión
      </button>`;

    const btnResolver = `
      <button onclick="abrirModalResolucion(${r.id})" class="tec-btn-resolver">
        ✅ Marcar como resuelto
      </button>`;

    return `
      <div class="tec-report-card" style="border-left-color:${state.border}">
        <div class="tec-card-header">
          <div class="tec-card-title">
            <span class="tec-type-icon">${icon}</span>
            <div>
              <strong class="tec-tipo">${r.tipo || "Reporte"}</strong>
              <span class="tec-id">#${r.id}</span>
            </div>
          </div>
          <div class="tec-badges">
            <span class="tec-badge" style="background:${prio.bg};color:${prio.color}">
              <span class="tec-dot" style="background:${prio.dot}"></span>${prioridad}
            </span>
            <span class="tec-badge" style="background:${state.bg};color:${state.color}">
              ${state.icon} ${estado}
            </span>
          </div>
        </div>

        <p class="tec-desc">${r.descripcion || "Sin descripción"}</p>

        <div class="tec-meta">
          <span>📍 ${r.zona || "—"}</span>
          <span>🗓️ ${fecha}</span>
        </div>

        <div class="tec-actions">
          ${btnRevision}
          ${btnResolver}
        </div>
      </div>
    `;
  }).join("");
}

/* =========================
   MODALES
========================= */
// Modal: En revisión → mensaje al admin
let _modalRevisionId = null;

function abrirModalRevision(reporteId) {
  _modalRevisionId = reporteId;
  document.getElementById("textoRevision").value = "";
  document.getElementById("modalRevision").style.display = "flex";
}
window.abrirModalRevision = abrirModalRevision;

async function confirmarRevision() {
  const mensaje = document.getElementById("textoRevision")?.value.trim();
  if (!mensaje) { alert("Escribí un mensaje antes de continuar."); return; }

  const session = JSON.parse(localStorage.getItem("cr_auth") || "{}");

  try {
    // Cambiar estado
    const res = await fetch(`${API}/reportes/${_modalRevisionId}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "en revision" })
    });
    if (!res.ok) throw new Error();

    // Enviar mensaje al admin
    await fetch(`${API}/mensajes-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tecnico_email: session.email || "",
        reporte_id: _modalRevisionId,
        mensaje,
        tipo: "revision"
      })
    });

    const r = reportesTecnico.find(x => x.id == _modalRevisionId);
    if (r) r.estado = "en revision";
    document.getElementById("modalRevision").style.display = "none";
    _modalRevisionId = null;
    aplicarFiltros();
  } catch {
    alert("❌ Error al actualizar el estado.");
  }
}
window.confirmarRevision = confirmarRevision;

// Modal: Resuelto → horas de resolución
let _modalResolucionId = null;

function abrirModalResolucion(reporteId) {
  _modalResolucionId = reporteId;
  document.getElementById("horasResolucion").value = "";
  document.getElementById("textoResolucion").value = "";
  document.getElementById("modalResolucion").style.display = "flex";
}
window.abrirModalResolucion = abrirModalResolucion;

async function confirmarResolucion() {
  const horas   = parseInt(document.getElementById("horasResolucion")?.value) || 0;
  const mensaje = document.getElementById("textoResolucion")?.value.trim();
  if (!horas || horas < 1) { alert("Ingresá la cantidad de horas (mínimo 1)."); return; }

  const session = JSON.parse(localStorage.getItem("cr_auth") || "{}");

  try {
    // Cambiar estado a resuelto
    const res = await fetch(`${API}/reportes/${_modalResolucionId}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "resuelto" })
    });
    if (!res.ok) throw new Error();

    // Enviar mensaje al admin con horas
    await fetch(`${API}/mensajes-admin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tecnico_email: session.email || "",
        reporte_id: _modalResolucionId,
        mensaje: mensaje || `Reporte resuelto en ${horas} hora${horas > 1 ? "s" : ""}.`,
        tipo: "resolucion",
        horas
      })
    });

    const r = reportesTecnico.find(x => x.id == _modalResolucionId);
    if (r) r.estado = "resuelto";
    document.getElementById("modalResolucion").style.display = "none";
    _modalResolucionId = null;
    aplicarFiltros();
  } catch {
    alert("❌ Error al marcar como resuelto.");
  }
}
window.confirmarResolucion = confirmarResolucion;

/* =========================
   CAMBIAR ESTADO (legacy)
========================= */
async function cambiarEstadoTec(id, nuevoEstado) {
  try {
    const res = await fetch(`${API}/reportes/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (!res.ok) throw new Error();
    const r = reportesTecnico.find(x => x.id == id);
    if (r) r.estado = nuevoEstado;
    aplicarFiltros();
  } catch {
    alert("Error al cambiar estado");
  }
}
window.cambiarEstadoTec = cambiarEstadoTec;
/* =========================
   EXPORTAR PDF TÉCNICO
========================= */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnExportarPDFTec")?.addEventListener("click", exportarPDFTecnico);
});

async function exportarPDFTecnico() {
  const session = JSON.parse(localStorage.getItem("cr_auth") || "{}");
  const correo  = session.email || "";
  const nombre  = session.nombre || correo.split("@")[0] || "Técnico";

  const resueltos = reportesTecnico.filter(r => (r.estado||"").toLowerCase() === "resuelto");

  if (resueltos.length === 0) {
    alert("No tenés reportes resueltos para exportar.");
    return;
  }

  // Obtener horas desde mensajes_admin
  let horasMap = {};
  try {
    const res  = await fetch(`${API}/mensajes-admin?tecnico=${encodeURIComponent(correo)}`);
    const msgs = await res.json();
    if (Array.isArray(msgs)) {
      msgs.filter(m => m.tipo === "resolucion" && m.horas).forEach(m => {
        if (!horasMap[m.reporte_id]) horasMap[m.reporte_id] = m.horas;
      });
    }
  } catch(e) { console.error(e); }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210, margin = 14;

  // ── ENCABEZADO ──────────────────────────────
  doc.setFillColor(0, 48, 135);
  doc.rect(0, 0, W, 42, "F");

  // Línea decorativa naranja
  doc.setFillColor(232, 99, 10);
  doc.rect(0, 42, W, 2, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Trabajos Resueltos del Técnico", margin, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Técnico: ${nombre}`, margin, 24);
  doc.text(`Email: ${correo}`, margin, 31);

  doc.setFontSize(9);
  doc.setTextColor(200, 220, 255);
  const hoy = new Date().toLocaleDateString("es-AR", { day:"2-digit", month:"long", year:"numeric" });
  doc.text(`Generado el ${hoy}`, W - margin, 24, { align: "right" });
  doc.text(`Total resueltos: ${resueltos.length}`, W - margin, 31, { align: "right" });

  let y = 54;

  // ── TABLA ────────────────────────────────────
  const cols = [
    { label: "#",          key: "id",          w: 10, align: "center" },
    { label: "Tipo",       key: "tipo",         w: 42 },
    { label: "Zona",       key: "zona",         w: 38 },
    { label: "Prioridad",  key: "prioridad",    w: 22, align: "center" },
    { label: "F. Reporte", key: "fecha",        w: 28, align: "center" },
    { label: "F. Resuelto",key: "fecha_resuelto",w: 28, align: "center" },
    { label: "Horas",      key: "horas",        w: 18, align: "center" },
  ];
  const tableW = cols.reduce((s, c) => s + c.w, 0);
  const rowH = 9;

  // Header de tabla
  doc.setFillColor(0, 48, 135);
  doc.rect(margin, y, tableW, rowH, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);

  let x = margin;
  cols.forEach(c => {
    const tx = c.align === "center" ? x + c.w / 2 : x + 2;
    doc.text(c.label, tx, y + 6, { align: c.align === "center" ? "center" : "left" });
    x += c.w;
  });
  y += rowH;

  // Filas de datos
  resueltos.forEach((r, i) => {
    if (y > 262) {
      doc.addPage();
      y = 18;
      // Repetir header
      doc.setFillColor(0, 48, 135);
      doc.rect(margin, y, tableW, rowH, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      let hx = margin;
      cols.forEach(c => {
        const tx = c.align === "center" ? hx + c.w / 2 : hx + 2;
        doc.text(c.label, tx, y + 6, { align: c.align === "center" ? "center" : "left" });
        hx += c.w;
      });
      y += rowH;
    }

    // Fila alterna
    if (i % 2 === 0) {
      doc.setFillColor(240, 244, 251);
      doc.rect(margin, y, tableW, rowH, "F");
    }

    const prio = (r.prioridad || "baja").toLowerCase();
    const prioColor = prio === "alta" ? [220,38,38] : prio === "media" ? [217,119,6] : [22,163,74];

    const fechaRep = r.fecha
      ? new Date(r.fecha).toLocaleDateString("es-AR", { day:"2-digit", month:"2-digit", year:"2-digit" })
      : "—";
    const fechaRes = r.fecha_resuelto
      ? new Date(r.fecha_resuelto).toLocaleDateString("es-AR", { day:"2-digit", month:"2-digit", year:"2-digit" })
      : "—";
    const horas = horasMap[r.id] ? `${horasMap[r.id]}h` : "—";

    const vals = [
      { v: `#${r.id}`,                    align: "center" },
      { v: (r.tipo || "—").slice(0, 22),  align: "left" },
      { v: (r.zona || "—").slice(0, 20),  align: "left" },
      { v: prio.toUpperCase(),            align: "center", color: prioColor },
      { v: fechaRep,                       align: "center" },
      { v: fechaRes,                       align: "center" },
      { v: horas,                          align: "center" },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);

    x = margin;
    vals.forEach((cell, vi) => {
      const col = cols[vi];
      const tx  = cell.align === "center" ? x + col.w / 2 : x + 2;
      doc.setTextColor(...(cell.color || [30, 30, 30]));
      if (cell.color) doc.setFont("helvetica", "bold");
      doc.text(String(cell.v), tx, y + 6, { align: cell.align });
      if (cell.color) doc.setFont("helvetica", "normal");
      x += col.w;
    });

    // Borde inferior de fila
    doc.setDrawColor(210, 218, 235);
    doc.setLineWidth(0.15);
    doc.line(margin, y + rowH, margin + tableW, y + rowH);
    y += rowH;
  });

  // ── RESUMEN ──────────────────────────────────
  y += 10;
  const totalHoras = Object.values(horasMap).reduce((s, h) => s + Number(h), 0);

  doc.setFillColor(240, 244, 251);
  doc.rect(margin, y - 4, tableW, 12, "F");
  doc.setDrawColor(0, 48, 135);
  doc.setLineWidth(0.4);
  doc.rect(margin, y - 4, tableW, 12, "S");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 48, 135);
  doc.text(`Total de reportes resueltos: ${resueltos.length}`, margin + 4, y + 4);
  doc.text(totalHoras > 0 ? `Total horas trabajadas: ${totalHoras}h` : "Horas no registradas", margin + tableW - 4, y + 4, { align: "right" });

  // ── FOOTER ───────────────────────────────────
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(160, 160, 160);
  doc.text("CityRepair · Sistema de Reportes EDET", W / 2, 289, { align: "center" });

  doc.save(`trabajos-resueltos-${nombre.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}
window.exportarPDFTecnico = exportarPDFTecnico;