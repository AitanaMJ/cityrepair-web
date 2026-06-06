const API = "http://localhost:3000/api";

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

  if (estado !== "todos") {
    lista = lista.filter(r => {
      const est = (r.estado || "pendiente").toLowerCase();
      if (estado === "en revision") return est.includes("rev");
      return est === estado;
    });
  }
  if (prio !== "todos") lista = lista.filter(r => (r.prioridad || "").toLowerCase() === prio);
  if (desde) lista = lista.filter(r => new Date(r.fecha) >= new Date(desde));
  if (hasta) lista = lista.filter(r => new Date(r.fecha) <= new Date(hasta));

  actualizarKPIs(lista);
  renderReportes(lista);
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

    // Botones dinámicos según estado
    const btnRevision = enRevision
      ? `<button onclick="cambiarEstadoTec(${r.id}, 'en revision')" class="tec-btn-revision tec-btn-revision--activo">
           🔄 En revisión
         </button>`
      : `<button onclick="abrirModalRevision(${r.id})" class="tec-btn-revision">
           🔄 En revisión
         </button>`;

    const btnResolver = enRevision
      ? `<button onclick="abrirModalResolucion(${r.id})" class="tec-btn-resolver tec-btn-resolver--outline">
           ✅ Marcar como resuelto
         </button>`
      : `<button onclick="abrirModalResolucion(${r.id})" class="tec-btn-resolver">
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