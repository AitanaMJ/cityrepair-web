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

    // 🔒 Verificar sesión
    if (!session) {
      window.location.href = "./login.html";
      return;
    }

    console.log("Sesión:", session);

    // 📡 Obtener reportes
    const res = await fetch('${API}/mis-reportes/${session.id}');

    if (!res.ok) {
      throw new Error("Error obteniendo reportes");
    }

    const data = await res.json();

    console.log("Reportes:", data);

    // 📌 Ordenar por fecha descendente
    reportesUsuario = data.sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );

    renderReportes();
  } catch (error) {
    console.error("Error cargando reportes:", error);

    contenedor.innerHTML = `
      <p>Error cargando reportes</p>
    `;
  }
}

/* =========================
   RENDER REPORTES
========================= */
function renderReportes(filtro = "todos") {
  contenedor.innerHTML = "";

  // 🔍 Filtrar reportes
  const lista =
    filtro === "todos"
      ? reportesUsuario
      : reportesUsuario.filter(
          (r) =>
            (r.estado || "").toLowerCase() === filtro.toLowerCase()
        );

  // ⚠️ Sin reportes
  if (lista.length === 0) {
    contenedor.innerHTML = `
      <p>No hay reportes</p>
    `;
    return;
  }

  // 📦 Crear tarjetas
  lista.forEach((reporte) => {
    const div = document.createElement("div");

    div.className = "reporte-card";

    div.innerHTML = `
      <h3>${reporte.tipo}</h3>

      <p>${reporte.descripcion}</p>

      <small>
        ${reporte.ubicacion} - ${reporte.zona}
      </small>

      <p>
        <strong>Estado:</strong>
        ${reporte.estado || "pendiente"}
      </p>

      <p>
        <strong>Prioridad:</strong>
        ${reporte.prioridad || "baja"}
      </p>

      <p>
        <strong>Fecha:</strong>
        ${new Date(reporte.fecha).toLocaleString()}
      </p>

      ${
        reporte.estado === "pendiente"
          ? `
            <button onclick="eliminarReporte(${reporte.id})">
              Eliminar
            </button>
          `
          : ""
      }
    `;

    contenedor.appendChild(div);
  });
}

/* =========================
   ELIMINAR REPORTE
========================= */
async function eliminarReporte(id) {
  const confirmar = confirm("¿Eliminar reporte?");

  if (!confirmar) return;

  try {
    const res = await fetch('${API}/reportes/${id}', {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("Error eliminando reporte");
    }

    // 🔄 Recargar lista
    cargarReportes();
  } catch (error) {
    console.error("Error eliminando:", error);

    alert("Error eliminando reporte");
  }
}

/* =========================
   EVENTOS
========================= */

// 🚀 Cargar al iniciar
document.addEventListener("DOMContentLoaded", cargarReportes);

// 🔍 Filtro por estado
if (filtroEstadoSelect) {
  filtroEstadoSelect.addEventListener("change", (e) => {
    renderReportes(e.target.value);
  });
}