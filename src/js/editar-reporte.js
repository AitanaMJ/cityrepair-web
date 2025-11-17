import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const tipoEl = document.getElementById("tipo");
const zonaEl = document.getElementById("zona");
const descripcionEl = document.getElementById("descripcion");
const historialLista = document.getElementById("historial-lista");
const form = document.getElementById("form-editar");

let reporteId = null;

// Leer el ID del reporte desde la URL o localStorage
const params = new URLSearchParams(location.search);
reporteId = params.get("id") || localStorage.getItem("reporteId");
if (reporteId) localStorage.setItem("reporteId", reporteId);

// Función para cargar los datos del reporte
async function cargarDatos() {
  if (!reporteId) return;

  try {
    const docRef = doc(db, "reportes", reporteId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      tipoEl.value = data.tipo || "";
      zonaEl.value = data.zona || "";
      descripcionEl.value = data.descripcion || "";

      // Mostrar historial si hay
      if (data.historial && Array.isArray(data.historial)) {
        historialLista.innerHTML = data.historial
          .map((item) => `<li>${item}</li>`)
          .join("");
      }
    }
  } catch (error) {
    console.error("Error al cargar el reporte:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron cargar los datos del reporte"
    });
  }
}

// Evento para guardar cambios
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const nuevaModificacion = `Modificado el ${new Date().toLocaleString()}`;
    const docRef = doc(db, "reportes", reporteId);

    await updateDoc(docRef, {
      tipo: tipoEl.value,
      zona: zonaEl.value,
      descripcion: descripcionEl.value,
      historial: arrayUnion(nuevaModificacion),
      ultimaModificacion: Timestamp.now()
    });

    // Mostrar mensaje elegante con redirección
    Swal.fire({
      icon: "success",
      title: "Cambios guardados",
      text: "El reporte fue actualizado exitosamente",
      showConfirmButton: false,
      timer: 2000
    }).then(() => {
      window.location.href = "mis-reportes.html";
    });

  } catch (error) {
    console.error("Error al guardar cambios:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudieron guardar los cambios"
    });
  }
});

// Iniciar
cargarDatos();