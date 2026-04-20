// src/js/tecnico-dashboard.js

const listaEl       = document.getElementById("lista-tecnico");
const kpiAsignados  = document.getElementById("kpiAsignados");
const kpiRevision   = document.getElementById("kpiRevision");
const kpiResueltos  = document.getElementById("kpiResueltos");

/* ---------- Helpers ---------- */
function badgeEstado(estado = "pendiente") {
  const e = (estado || "").toLowerCase();
  if (e === "resuelto")
    return <span class="tag tag--green">Resuelto</span>;
  if (e.includes("rev"))
    return <span class="tag tag--blue">En revisión</span>;
  return <span class="tag tag--blue">Pendiente</span>;
}

function badgePrioridad(p = "baja") {
  const pp = (p || "").toLowerCase();
  if (pp === "alta")
    return <span class="tag tag--red">Alta</span>;
  if (pp === "media")
    return <span class="tag tag--yellow">Media</span>;
  return <span class="tag tag--gray">Baja</span>;
}

function formatearFecha(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* ---------- Verificar sesión ---------- */
document.addEventListener("DOMContentLoaded", () => {

  const session = JSON.parse(localStorage.getItem("cr_auth"));

  // 🔥 PROTECCIÓN DE ROL
  if (!session || session.role !== "tecnico") {
    window.location.href = "./login.html";
    return;
  }

  cargarReportesTecnico(session.email);
});

/* ---------- Cargar reportes asignados ---------- */
function cargarReportesTecnico(emailTecnico) {
  const todos = JSON.parse(localStorage.getItem("reportes")) || [];

  const asignados = todos.filter(r =>
    (r.tecnicoEmail || "").toLowerCase() === emailTecnico.toLowerCase()
  );

  renderReportes(asignados);
  actualizarKPIs(asignados);
}

/* ---------- Render ---------- */
function renderReportes(reportes = []) {
  if (!listaEl) return;

  if (reportes.length === 0) {
    listaEl.innerHTML = `
      <p class="muted">No tenés reportes asignados.</p>`;
    return;
  }

  listaEl.innerHTML = reportes.map(r => {

    const fecha = formatearFecha(r.fecha);
    const codigo = r.codigoSeguimiento || "CR-" + r.id.slice(0,6).toUpperCase();

    return `
      <div class="card-reporte-tec" data-id="${r.id}">
        <div>
          <strong>#${codigo}</strong>
          <div>${fecha}</div>
        </div>

        <div>
          <div>${r.tipo || "Reporte"}</div>
          <div>${r.ubicacion || "Sin dirección"}</div>
          <p>${r.descripcion || ""}</p>
        </div>

        <div>${badgeEstado(r.estado)}</div>
        <div>${badgePrioridad(r.prioridad)}</div>

        <div>
          <button class="btn-estado" data-estado="en revisión">
            En revisión
          </button>
          <button class="btn-estado" data-estado="resuelto">
            Marcar resuelto
          </button>
        </div>
      </div>
    `;
  }).join("");

  document.querySelectorAll(".btn-estado").forEach(btn => {
    btn.addEventListener("click", cambiarEstado);
  });
}

/* ---------- Cambiar estado ---------- */
function cambiarEstado(e) {

  const btn = e.currentTarget;
  const row = btn.closest(".card-reporte-tec");
  const id  = row.dataset.id;
  const nuevoEstado = btn.dataset.estado;

  let reportes = JSON.parse(localStorage.getItem("reportes")) || [];

  reportes = reportes.map(r => {
    if (r.id === id) {
      r.estado = nuevoEstado;
      if (nuevoEstado === "resuelto") {
        r.fechaResuelto = new Date().toISOString();
      }
    }
    return r;
  });

  localStorage.setItem("reportes", JSON.stringify(reportes));

  cargarReportesTecnico(
    JSON.parse(localStorage.getItem("cr_auth")).email
  );

  alert("Estado actualizado");
}

/* ---------- KPIs ---------- */
function actualizarKPIs(reportes = []) {
  const total = reportes.length;

  const revision = reportes.filter(r =>
    (r.estado || "").toLowerCase().includes("rev")
  ).length;

  const resueltos = reportes.filter(r =>
    (r.estado || "").toLowerCase() === "resuelto"
  ).length;

  if (kpiAsignados) kpiAsignados.textContent = total;
  if (kpiRevision)  kpiRevision.textContent  = revision;
  if (kpiResueltos) kpiResueltos.textContent = resueltos;
}