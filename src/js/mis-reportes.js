const API = "http://localhost:3000/api";

const contenedor = document.getElementById("lista-reportes");
const filtroEstadoSelect = document.getElementById("filtro-estado");

let reportesUsuario = [];

/* =========================
   CARGAR REPORTES
========================= */
async function cargarReportes() {
  try {
    const session = JSON.parse(localStorage.getItem("cr_auth"));

    if (!session) {
      window.location.href = "./login.html";
      return;
    }

    console.log("Sesion:", session);

    const res = await fetch(`${API}/mis-reportes/${session.id}`);

    if (!res.ok) {
      throw new Error("Error obteniendo reportes");
    }

    const data = await res.json();

    console.log("Reportes:", data);

    reportesUsuario = data.sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );

    renderReportes();
  } catch (error) {
    console.error("Error cargando reportes:", error);
    contenedor.innerHTML = `<p class="error-msg">Error cargando reportes</p>`;
  }
}

/* =========================
  RENDER REPORTES
========================= */
function renderReportes(filtro = "todos") {
  contenedor.innerHTML = "";

  const lista =
    filtro === "todos"
      ? reportesUsuario
      : reportesUsuario.filter(
          (r) => (r.estado || "").toLowerCase() === filtro.toLowerCase()
        );

  if (lista.length === 0) {
    contenedor.innerHTML = `<p class="empty-msg">No hay reportes</p>`;
    return;
  }

  lista.forEach((reporte) => {
    const estado = reporte.estado || "pendiente";
    const prioridad = reporte.prioridad || "baja";
    const fecha = new Date(reporte.fecha).toLocaleDateString("es-AR", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
    });

    const iconos = {
      "corte-total": "⚡",
      "corte-parcial": "🔌",
      "cable-caido": "🪛",
      "medidor-quemado": "🔥",
      "baja-tension": "📉",
      "poste-danado": "🏚️",
    };
    const icono = iconos[reporte.tipo] || "📋";

    const div = document.createElement("div");
    div.className = "reporte-card";
    div.innerHTML = `
      <div class="reporte-header">
        <div class="reporte-tipo">
          <span class="reporte-icono">${icono}</span>
          ${reporte.tipo}
        </div>
        <span class="reporte-estado ${estado.replace(" ", "-")}">${estado}</span>
      </div>

      <p class="reporte-descripcion">${reporte.descripcion}</p>

      <div class="reporte-meta">
        <span>📍 ${reporte.ubicacion}</span>
        <span>🏘️ ${reporte.zona}</span>
        <span>🕐 ${fecha}</span>
        <span class="reporte-prioridad prioridad-${prioridad}">🚨 ${prioridad}</span>
      </div>

      ${estado === "pendiente" ? `
        <div class="report-actions">
          <button class="btn-edit" onclick="editarReporte(${reporte.id})">✏️ Editar</button>
          <button class="btn-delete" onclick="eliminarReporte(${reporte.id})">🗑️ Eliminar</button>
        </div>
      ` : ""}
    `;

    contenedor.appendChild(div);
  });
}

/* =========================
   EDITAR REPORTE
========================= */
function editarReporte(id) {
  window.location.href = `./editar-reporte.html?id=${id}`;
}

/* =========================
   ELIMINAR REPORTE
========================= */
async function eliminarReporte(id) {
  const confirmar = confirm("¿Eliminar este reporte?");
  if (!confirmar) return;

  try {
    const res = await fetch(`${API}/reportes/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error eliminando reporte");

    cargarReportes();
  } catch (error) {
    console.error("Error eliminando:", error);
    alert("Error eliminando reporte");
  }
}

/* =========================
   EVENTOS
========================= */
document.addEventListener("DOMContentLoaded", cargarReportes);

if (filtroEstadoSelect) {
  filtroEstadoSelect.addEventListener("change", (e) => {
    renderReportes(e.target.value);
  });
}

window.eliminarReporte = eliminarReporte;
window.editarReporte = editarReporte;