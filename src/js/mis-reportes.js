const API = "http://localhost:3000/api";

const contenedor = document.getElementById("lista-reportes");
const filtroEstadoSelect = document.getElementById("filtro-estado");

let reportesUsuario = [];

/* ---------- Cargar reportes ---------- */
async function cargarReportes() {
  try {
    const session = JSON.parse(localStorage.getItem("cr_auth"));

    if (!session) {
      window.location.href = "./login.html";
      return;
    }

    const res = await fetch('${API}/reportes');
    const data = await res.json();

    reportesUsuario = data
      .filter(r => r.usuario_id === session.id)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    renderReportes();

  } catch (err) {
    console.error("Error:", err);
  }
}

/* ---------- Render ---------- */
function renderReportes(filtro = "todos") {
  contenedor.innerHTML = "";

  let lista = reportesUsuario;

  if (filtro !== "todos") {
    lista = lista.filter(r =>
      (r.estado || "").toLowerCase() === filtro
    );
  }

  if (lista.length === 0) {
    contenedor.innerHTML = "<p>No hay reportes</p>";
    return;
  }

  lista.forEach(r => {
    const div = document.createElement("div");

    div.innerHTML = `
      <div class="reporte-card">
        <h3>${r.tipo}</h3>
        <p>${r.descripcion}</p>
        <small>${r.ubicacion} - ${r.zona}</small>

        <p><b>Estado:</b> ${r.estado || "pendiente"}</p>

        ${r.estado === "pendiente" ? `
          <button onclick="eliminarReporte(${r.id})">
            Eliminar
          </button>
        ` : ""}
      </div>
    `;

    contenedor.appendChild(div);
  });
}

/* ---------- Eliminar ---------- */
async function eliminarReporte(id) {
  if (!confirm("¿Eliminar reporte?")) return;

  try {
    await fetch('${API}/reportes/${id}', {
      method: "DELETE"
    });

    cargarReportes();

  } catch (err) {
    console.error("Error eliminando:", err);
  }
}

/* ---------- Eventos ---------- */
document.addEventListener("DOMContentLoaded", cargarReportes);

filtroEstadoSelect?.addEventListener("change", (e) => {
  renderReportes(e.target.value);
});