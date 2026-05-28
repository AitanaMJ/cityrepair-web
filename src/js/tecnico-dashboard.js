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
    reportesTecnico = data.map(r => ({ ...r, fecha: new Date(r.fecha) }));
    aplicarFiltros();
  } catch (err) {
    console.error("Error:", err);
    listaEl.innerHTML = `<p style="color:#dc2626; padding:16px;">Error cargando reportes</p>`;
  }
}

/* =========================
   FILTROS
========================= */
function aplicarFiltros() {
  let lista = [...reportesTecnico];

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
    listaEl.innerHTML = `<p class="muted" style="padding:20px; text-align:center; color:#9ca3af;">No hay reportes asignados.</p>`;
    return;
  }

  listaEl.innerHTML = reportes.map(r => {
    const estado    = (r.estado || "pendiente").toLowerCase();
    const prioridad = (r.prioridad || "baja").toLowerCase();
    const fecha     = new Date(r.fecha).toLocaleDateString("es-AR", {
      day: "2-digit", month: "short", year: "numeric"
    });

    const estadoColor = estado === "resuelto" ? "#16a34a" : estado.includes("rev") ? "#d97706" : "#3b82f6";
    const prioColor   = prioridad === "alta" ? "#dc2626" : prioridad === "media" ? "#d97706" : "#16a34a";
    const prioBg      = prioridad === "alta" ? "#fee2e2" : prioridad === "media" ? "#fef3c7" : "#dcfce7";

    return `
      <div style="background:#fff; border-radius:14px; padding:18px; margin-bottom:12px;
                  border:1px solid #f0f0f0; border-left:5px solid ${estadoColor};
                  box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <strong style="font-size:0.95rem; color:#111827; text-transform:capitalize;">${r.tipo || "Reporte"}</strong>
          <div style="display:flex; gap:8px; align-items:center;">
            <span style="background:${prioBg}; color:${prioColor}; padding:2px 10px; border-radius:999px; font-size:0.72rem; font-weight:700;">${prioridad}</span>
            <span style="background:#f3f4f6; color:#374151; padding:2px 10px; border-radius:999px; font-size:0.72rem; font-weight:700; text-transform:capitalize;">${estado}</span>
          </div>
        </div>
        <p style="font-size:0.85rem; color:#4b5563; margin:0 0 8px;">${r.descripcion || ""}</p>
        <div style="font-size:0.78rem; color:#9ca3af; display:flex; gap:12px; flex-wrap:wrap; margin-bottom:12px;">
          <span>📍 ${r.zona || "—"}</span>
          <span>🕐 ${fecha}</span>
        </div>
        <div style="display:flex; gap:8px;">
          <button onclick="cambiarEstadoTec(${r.id}, 'en revision')"
            style="flex:1; padding:7px; background:#fff; color:#d97706; border:1.5px solid #d97706;
                   border-radius:8px; font-family:'DM Sans',sans-serif; font-size:0.82rem; font-weight:600; cursor:pointer;">
            🔄 En revisión
          </button>
          <button onclick="cambiarEstadoTec(${r.id}, 'resuelto')"
            style="flex:1; padding:7px; background:#16a34a; color:#fff; border:none;
                   border-radius:8px; font-family:'DM Sans',sans-serif; font-size:0.82rem; font-weight:600; cursor:pointer;">
            ✅ Resuelto
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