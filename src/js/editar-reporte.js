const API = "http://localhost:3000/api";

const tipoEl = document.getElementById("tipo");
const zonaEl = document.getElementById("zona");
const descripcionEl = document.getElementById("descripcion");
const historialLista = document.getElementById("historial-lista");
const form = document.getElementById("form-editar");

const params = new URLSearchParams(location.search);
const reporteId = params.get("id");

if (!reporteId) {
  Swal.fire({ icon: "error", title: "ID de reporte no encontrado" })
    .then(() => window.location.href = "mis-reportes.html");
}

/* ---------------------------------------------------
   Cargar datos del reporte desde el backend
--------------------------------------------------- */
async function cargarDatos() {
  try {
    const res = await fetch(`${API}/reportes/${reporteId}`);

    if (!res.ok) throw new Error("Reporte no encontrado");

    const reporte = await res.json();

    tipoEl.value = reporte.tipo || "";
    zonaEl.value = reporte.zona || "";
    descripcionEl.value = reporte.descripcion || "";

    if (historialLista) {
      historialLista.innerHTML = `<li>Creado el ${new Date(reporte.fecha).toLocaleString()}</li>`;
    }

  } catch (error) {
    Swal.fire({ icon: "error", title: "Reporte no encontrado" })
      .then(() => window.location.href = "mis-reportes.html");
  }
}

/* ---------------------------------------------------
   Guardar cambios en el backend
--------------------------------------------------- */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const res = await fetch(`${API}/reportes/${reporteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipo: tipoEl.value,
        zona: zonaEl.value,
        descripcion: descripcionEl.value,
      }),
    });

    if (!res.ok) throw new Error("Error al guardar");

    Swal.fire({
      icon: "success",
      title: "Cambios guardados",
      text: "El reporte fue actualizado exitosamente",
      showConfirmButton: false,
      timer: 2000,
    }).then(() => {
      window.location.href = "mis-reportes.html";
    });

  } catch (error) {
    Swal.fire({ icon: "error", title: "Error al guardar los cambios" });
  }
});

/* ---------------------------------------------------
   Iniciar
--------------------------------------------------- */
cargarDatos();