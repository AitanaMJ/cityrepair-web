// src/js/editar-reporte.js
import { db, auth, storage } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";

const params = new URLSearchParams(window.location.search);
const reporteId = params.get("id");

const form = document.getElementById("form-editar");
const tipoEl = document.getElementById("tipo");
const ubicacionEl = document.getElementById("ubicacion");
const zonaEl = document.getElementById("zona");
const descripcionEl = document.getElementById("descripcion");
const inputImagenes = document.getElementById("imagenes");
const previewImagenesActuales = document.getElementById("preview-imagenes-actuales");
const historialLista = document.getElementById("historial-lista");

let reporteData = null;
let imagenesAEliminar = [];
let map;
let marker;

// ====== MAPA (con guardado de lat/lng) ======
function initMap(latInicial = -26.8242, lngInicial = -65.2226) {
  const mapEl = document.getElementById("map");
  if (!mapEl || typeof L === "undefined") return;

  map = L.map("map").setView([latInicial, lngInicial], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  marker = L.marker([latInicial, lngInicial]).addTo(map);

  const coordsEl = document.getElementById("coords");
  if (coordsEl) {
    coordsEl.textContent =
      `Lat: ${latInicial.toFixed(5)} · Lng: ${lngInicial.toFixed(5)}`;
  }

  map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    marker.setLatLng(e.latlng);
    if (coordsEl) {
      coordsEl.textContent = `Lat: ${lat.toFixed(5)} · Lng: ${lng.toFixed(5)}`;
    }
  });
}

// ====== Render historial ======
function renderHistorial(historial) {
  if (!historialLista) return;

  historialLista.innerHTML = "";

  if (!Array.isArray(historial) || historial.length === 0) {
    historialLista.innerHTML = "<li>No hay modificaciones registradas.</li>";
    return;
  }

  // mostrar del más reciente al más viejo
  const ordenado = [...historial].sort(
    (a, b) => (b.fecha?.seconds || 0) - (a.fecha?.seconds || 0)
  );

  ordenado.forEach((item) => {
    const li = document.createElement("li");
    const fecha = item.fecha?.toDate
      ? item.fecha.toDate()
      : item.fecha
      ? new Date(item.fecha)
      : null;

    const fechaStr = fecha
      ? fecha.toLocaleString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "(sin fecha)";

    li.textContent = `• ${fechaStr} – Modificación realizada`;
    historialLista.appendChild(li);
  });
}

// ====== Render de imágenes actuales con botón eliminar ======
function renderImagenesActuales(imagenes) {
  if (!previewImagenesActuales) return;
  previewImagenesActuales.innerHTML = "";

  if (!Array.isArray(imagenes) || imagenes.length === 0) {
    previewImagenesActuales.textContent = "No hay imágenes cargadas para este reporte.";
    return;
  }

  imagenes.forEach((url) => {
    const wrap = document.createElement("div");
    wrap.classList.add("edit-preview-item");

    const img = document.createElement("img");
    img.src = url;
    img.alt = "Imagen del reporte";

    const btnX = document.createElement("button");
    btnX.type = "button";
    btnX.textContent = "✕";
    btnX.classList.add("btn-remove-img");

    btnX.addEventListener("click", () => {
      // marcar para eliminar
      imagenesAEliminar.push(url);
      wrap.remove();
    });

    wrap.appendChild(img);
    wrap.appendChild(btnX);
    previewImagenesActuales.appendChild(wrap);
  });
}

// ====== Cargar datos del reporte ======
async function cargarDatos() {
  const refDoc = doc(db, "reportes", reporteId);
  const snap = await getDoc(refDoc);

  if (!snap.exists()) {
    alert("El reporte no existe.");
    window.location.href = "./mis-reportes.html";
    return;
  }

  const data = snap.data();
  reporteData = data;

  // solo pendiente puede editarse
  if ((data.estado || "pendiente") !== "pendiente") {
    alert("Este reporte ya fue tomado y no puede editarse.");
    window.location.href = "./mis-reportes.html";
    return;
  }

  // rellenar formulario
  if (data.tipo) tipoEl.value = data.tipo;
  if (data.ubicacion) ubicacionEl.value = data.ubicacion;
  if (data.zona) zonaEl.value = data.zona;
  if (data.descripcion) descripcionEl.value = data.descripcion;

  // mapa: si ya tiene coords, usarlas
  const lat = typeof data.lat === "number" ? data.lat : -26.8242;
  const lng = typeof data.lng === "number" ? data.lng : -65.2226;
  initMap(lat, lng);

  // imágenes actuales
  const imagenes = Array.isArray(data.imagenes) ? data.imagenes : [];
  renderImagenesActuales(imagenes);

  // historial
  const historial = Array.isArray(data.historial) ? data.historial : [];
  renderHistorial(historial);
}

// ====== Guardar cambios ======
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const tipo = tipoEl.value.trim();
  const ubicacion = ubicacionEl.value.trim();
  const zona = zonaEl.value.trim();
  const descripcion = descripcionEl.value.trim();

  if (!tipo || !ubicacion || !zona || !descripcion) {
    alert("Por favor completa todos los campos obligatorios.");
    return;
  }

  try {
    const updateData = {
      tipo,
      ubicacion,
      zona,
      descripcion,
      fechaEdicion: serverTimestamp()
    };

    // coords desde el marcador
    if (marker) {
      const pos = marker.getLatLng();
      updateData.lat = pos.lat;
      updateData.lng = pos.lng;
    }

    // imágenes existentes filtradas (quitando las marcadas para eliminar)
    const actuales = Array.isArray(reporteData?.imagenes)
      ? reporteData.imagenes.filter((url) => !imagenesAEliminar.includes(url))
      : [];

    const archivos = inputImagenes ? Array.from(inputImagenes.files) : [];
    let nuevasUrls = [];

    if (archivos.length > 0) {
      const promesas = archivos.map((archivo, i) => {
        const storageRef = ref(
          storage,
          `reportes/${reporteId}/edit-${Date.now()}-${i}-${archivo.name}`
        );
        return uploadBytes(storageRef, archivo).then((snap) =>
          getDownloadURL(snap.ref)
        );
      });

      nuevasUrls = await Promise.all(promesas);
    }

    // combinar imágenes finales
    if (actuales.length > 0 || nuevasUrls.length > 0) {
      updateData.imagenes = [...actuales, ...nuevasUrls];
    } else {
      updateData.imagenes = [];
    }

    // historial: agregamos una entrada más
    const historialAnterior = Array.isArray(reporteData?.historial)
      ? reporteData.historial
      : [];

    const nuevoHistorial = [
      ...historialAnterior,
      {
        fecha: serverTimestamp(),
        cambios: {
          tipo,
          ubicacion,
          zona,
          descripcion
        }
      }
    ];

    updateData.historial = nuevoHistorial;

    await updateDoc(doc(db, "reportes", reporteId), updateData);

    alert("Reporte actualizado correctamente.");
    window.location.href = "./mis-reportes.html";
  } catch (error) {
    console.error("Error al actualizar reporte:", error);
    alert("No se pudo actualizar el reporte.");
  }
});

// ====== Auth + init ======
onAuthStateChanged(auth, (user) => {
  if (!user) {
    alert("Debes iniciar sesión.");
    window.location.href = "./login.html";
    return;
  }
  // el mapa se inicializa dentro de cargarDatos ahora
  cargarDatos();
});