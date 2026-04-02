// editar-reporte.js (SIN Firebase)

const tipoEl = document.getElementById("tipo");
const zonaEl = document.getElementById("zona");
const descripcionEl = document.getElementById("descripcion");
const historialLista = document.getElementById("historial-lista");
const form = document.getElementById("form-editar");

let reporteId = null;

// Leer ID desde URL o localStorage
const params = new URLSearchParams(location.search);
reporteId = params.get("id") || localStorage.getItem("reporteId");

if (reporteId) {
  localStorage.setItem("reporteId", reporteId);
}

/* ---------------------------------------------------
   Obtener todos los reportes
--------------------------------------------------- */
function getReportes() {
  return JSON.parse(localStorage.getItem("reportes")) || [];
}

/* ---------------------------------------------------
   Guardar reportes
--------------------------------------------------- */
function saveReportes(reportes) {
  localStorage.setItem("reportes", JSON.stringify(reportes));
}

/* ---------------------------------------------------
   Cargar datos del reporte
--------------------------------------------------- */
function cargarDatos() {
  if (!reporteId) return;

  const reportes = getReportes();
  const reporte = reportes.find(r => r.id === reporteId);

  if (!reporte) {
    Swal.fire({
      icon: "error",
      title: "Reporte no encontrado"
    });
    return;
  }

  tipoEl.value = reporte.tipo || "";
  zonaEl.value = reporte.zona || "";
  descripcionEl.value = reporte.descripcion || "";

  if (reporte.historial && Array.isArray(reporte.historial)) {
    historialLista.innerHTML = reporte.historial
      .map(item => `<li>${item}</li>`)
      .join("");
  }
}

/* ---------------------------------------------------
   Guardar cambios
--------------------------------------------------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const reportes = getReportes();
  const index = reportes.findIndex(r => r.id === reporteId);

  if (index === -1) {
    Swal.fire({
      icon: "error",
      title: "Reporte no encontrado"
    });
    return;
  }

  const nuevaModificacion = `Modificado el ${new Date().toLocaleString()}`;

  reportes[index].tipo = tipoEl.value;
  reportes[index].zona = zonaEl.value;
  reportes[index].descripcion = descripcionEl.value;
  reportes[index].ultimaModificacion = new Date().toISOString();

  if (!Array.isArray(reportes[index].historial)) {
    reportes[index].historial = [];
  }

  reportes[index].historial.push(nuevaModificacion);

  saveReportes(reportes);

  Swal.fire({
    icon: "success",
    title: "Cambios guardados",
    text: "El reporte fue actualizado exitosamente",
    showConfirmButton: false,
    timer: 2000
  }).then(() => {
    window.location.href = "mis-reportes.html";
  });
});

/* ---------------------------------------------------
   Iniciar
--------------------------------------------------- */
cargarDatos();