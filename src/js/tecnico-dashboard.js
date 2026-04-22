const API = "http://localhost:3000/api";

const listaEl       = document.getElementById("lista-tecnico");
const kpiAsignados  = document.getElementById("kpiAsignados");
const kpiRevision   = document.getElementById("kpiRevision");
const kpiResueltos  = document.getElementById("kpiResueltos");

const filtroEstado = document.getElementById("filtro-estado");
const filtroZona   = document.getElementById("filtro-zona");
const filtroPrioridad = document.getElementById("filtro-prioridad");

let reportesGlobal = [];

/* ---------- Helpers ---------- */
function badgeEstado(estado = "pendiente") {
  const e = (estado || "").toLowerCase();

  if (e === "resuelto") {
    return <span class="tag tag--green">Resuelto</span>;
  }

  if (e.includes("rev")) {
    return <span class="tag tag--blue">En revisión</span>;
  }

  return <span class="tag tag--gray">Pendiente</span>;
}

function badgePrioridad(p = "baja") {
  const pp = (p || "").toLowerCase();

  if (pp === "alta") {
    return <span class="tag tag--red">Alta</span>;
  }

  if (pp === "media") {
    return <span class="tag tag--yellow">Media</span>;
  }

  return <span class="tag tag--gray">Baja</span>;
}

function formatearFecha(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString("es-AR");
}

/* ---------- INIT ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const session = JSON.parse(localStorage.getItem("cr_auth"));

  if (!session || session.role !== "tecnico") {
    window.location.href = "./login.html";
    return;
  }

  cargarReportes(session.email);

  filtroEstado?.addEventListener("change", aplicarFiltros);
  filtroZona?.addEventListener("change", aplicarFiltros);
  filtroPrioridad?.addEventListener("change", aplicarFiltros);
});

/* ---------- Cargar desde backend ---------- */
async function cargarReportes(email) {
  try {
    const res = await fetch('${API}/reportes/tecnico/${email}');

    if (!res.ok) throw new Error("Error al traer reportes");

    const data = await res.json();

    reportesGlobal = data;

    aplicarFiltros();

  } catch (err) {
    console.error("Error cargando reportes:", err);
    listaEl.innerHTML = <p>Error cargando reportes</p>;
  }
}

/* ---------- Filtros ---------- */
function aplicarFiltros() {
  let filtrados = [...reportesGlobal];

  if (filtroEstado?.value) {
    filtrados = filtrados.filter(r =>
      (r.estado || "").toLowerCase().includes(filtroEstado.value)
    );
  }

  if (filtroZona?.value) {
    filtrados = filtrados.filter(r =>
      (r.zona || "") === filtroZona.value
    );
  }

  if (filtroPrioridad?.value) {
    filtrados = filtrados.filter(r =>
      (r.prioridad || "") === filtroPrioridad.value
    );
  }

  renderReportes(filtrados);
  actualizarKPIs(filtrados);
}

/* ---------- Render ---------- */
function renderReportes(reportes = []) {
  if (!listaEl) return;

  if (reportes.length === 0) {
    listaEl.innerHTML = <p>No hay reportes</p>;
    return;
  }

  listaEl.innerHTML = reportes.map(r => `
    <div class="card-reporte-tec">
      
      <div>
        <strong>#${r.id}</strong>
        <div>${formatearFecha(r.fecha)}</div>
      </div>

      <div>
        <div>${r.tipo || "Sin tipo"}</div>
        <div>${r.ubicacion || "Sin ubicación"}</div>
        <p>${r.descripcion || ""}</p>
      </div>

      <div>${badgeEstado(r.estado)}</div>
      <div>${badgePrioridad(r.prioridad)}</div>

      <div>
        <button onclick="cambiarEstado(${r.id}, 'en revision')">
          En revisión
        </button>

        <button onclick="cambiarEstado(${r.id}, 'resuelto')">
          Resuelto
        </button>
      </div>

    </div>
  `).join("");
}

/* ---------- Cambiar estado ---------- */
async function cambiarEstado(id, estado) {
  try {
    const res = await fetch('${API}/reportes/${id}/estado', {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ estado })
    });

    if (!res.ok) throw new Error("Error actualizando");

    const session = JSON.parse(localStorage.getItem("cr_auth"));

    cargarReportes(session.email);

  } catch (err) {
    console.error("Error actualizando:", err);
  }
}

/* ---------- KPIs ---------- */
function actualizarKPIs(reportes) {
  kpiAsignados.textContent = reportes.length;

  kpiRevision.textContent = reportes.filter(r =>
    (r.estado || "").includes("rev")
  ).length;

  kpiResueltos.textContent = reportes.filter(r =>
    r.estado === "resuelto"
  ).length;
}