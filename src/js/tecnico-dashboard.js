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
    alta:  { bg: "#fee2e2", color: "#b91c1c", dot: "#ef4444", label: "🔴 Alta" },
    media: { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b", label: "🟡 Media" },
    baja:  { bg: "#dcfce7", color: "#166534", dot: "#22c55e", label: "🟢 Baja" },
  };

  const stateConfig = {
    "en revision": { bg: "#fef3c7", color: "#92400e", border: "#f59e0b", icon: "🔄" },
    "pendiente":   { bg: "#dbeafe", color: "#1d4ed8", border: "#3b82f6", icon: "📋" },
  };

  const typeIcons = {
    "corte": "⚡", "baja-tension": "🔌", "transformador": "🔧",
    "luminaria": "💡", "cable": "🔗", "medidor": "⚙️", "poste": "🪝"
  };

  listaEl.innerHTML = reportes.map(r => {
    const estado    = (r.estado || "pendiente").toLowerCase();
    const prioridad = (r.prioridad || "baja").toLowerCase();
    const fecha     = new Date(r.fecha).toLocaleDateString("es-AR", {
      day: "2-digit", month: "short", year: "numeric"
    });

    const prio  = prioConfig[prioridad]  || prioConfig.baja;
    const state = stateConfig[estado]    || stateConfig.pendiente;
    const tipoKey = Object.keys(typeIcons).find(k => (r.tipo || "").toLowerCase().includes(k));
    const icon  = typeIcons[tipoKey] || "🛠️";

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
          <button onclick="cambiarEstadoTec(${r.id}, 'en revision')" class="tec-btn-revision">
            🔄 En revisión
          </button>
          <button onclick="cambiarEstadoTec(${r.id}, 'resuelto')" class="tec-btn-resolver">
            ✅ Marcar como resuelto
          </button>
        </div>
      </div>
    `;
  }).join("");
}

/* =========================
   CAMBIAR ESTADO
========================= */
async function cambiarEstadoTec(id, nuevoEstado) {
  try {
    const res = await fetch(`${API}/reportes/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado })
    });
    if (!res.ok) throw new Error("Error");
    const r = reportesTecnico.find(x => x.id == id);
    if (r) r.estado = nuevoEstado;
    aplicarFiltros();
  } catch (err) {
    alert("Error al cambiar estado");
  }
}
window.cambiarEstadoTec = cambiarEstadoTec;