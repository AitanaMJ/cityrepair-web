const API = "http://localhost:3000/api";

const contenedor = document.getElementById("lista-reportes");
const filtroEstadoSelect = document.getElementById("filtro-estado");

let reportesUsuario = [];

/* =========================
   CARGAR REPORTES
========================= */
async function cargarReportes() {

  try {

    const session = JSON.parse(
      localStorage.getItem("cr_auth")
    );

    // 🔒 Verificar sesión
    if (!session) {
      window.location.href = "./login.html";
      return;
    }

    console.log("Sesión:", session);

    // ✅ Obtener reportes del usuario
    const res = await fetch(
      '${API}/mis-reportes/${session.id}'
    );

    if (!res.ok) {
      throw new Error("Error obteniendo reportes");
    }

    const data = await res.json();

    console.log("Reportes:", data);

    // ✅ Guardar reportes
    reportesUsuario = data.sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );

    renderReportes();

  } catch (err) {

    console.error("Error:", err);

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

  let lista = reportesUsuario;

  // ✅ Filtrar por estado
  if (filtro !== "todos") {

    lista = lista.filter(r =>
      (r.estado || "").toLowerCase() === filtro
    );
  }

  // ✅ Sin reportes
  if (lista.length === 0) {

    contenedor.innerHTML = `
      <p>No hay reportes</p>
    `;

    return;
  }

  // ✅ Mostrar reportes
  lista.forEach(r => {

    const div = document.createElement("div");

    div.className = "reporte-card";

    div.innerHTML = `
      <h3>${r.tipo}</h3>

      <p>${r.descripcion}</p>

      <small>
        ${r.ubicacion} - ${r.zona}
      </small>

      <p>
        <b>Estado:</b>
        ${r.estado || "pendiente"}
      </p>

      <p>
        <b>Prioridad:</b>
        ${r.prioridad || "baja"}
      </p>

      <p>
        <b>Fecha:</b>
        ${new Date(r.fecha).toLocaleString()}
      </p>

      ${r.estado === "pendiente"
        ? `
          <button onclick="eliminarReporte(${r.id})">
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

  if (!confirm("¿Eliminar reporte?")) return;

  try {

    const res = await fetch(
      '${API}/reportes/${id}',
      {
        method: "DELETE"
      }
    );

    if (!res.ok) {
      throw new Error("Error eliminando");
    }

    cargarReportes();

  } catch (err) {

    console.error(err);

    alert("Error eliminando reporte");
  }
}

/* =========================
   EVENTOS
========================= */
document.addEventListener(
  "DOMContentLoaded",
  cargarReportes
);

filtroEstadoSelect?.addEventListener(
  "change",
  (e) => {
    renderReportes(e.target.value);
  }
);