// src/js/mis-reportes.js
import { auth, db, storage } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import {
  ref,
  deleteObject
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const contenedor = document.getElementById("lista-reportes");
const sinReportesEl = document.getElementById("sin-reportes");
const filtroEstadoSelect = document.getElementById("filtro-estado");

// elementos del resumen
const resumenPendienteEl = document.getElementById("resumen-pendiente");
const resumenEnprocesoEl = document.getElementById("resumen-enproceso");
const resumenResueltoEl = document.getElementById("resumen-resuelto");

// acá guardamos todos los reportes del usuario
let reportesUsuario = [];

function mostrarMensajeCargando() {
  if (!contenedor) return;
  contenedor.innerHTML = `
    <div class="col-12">
      <p class="text-center text-muted mt-5">Cargando reportes...</p>
    </div>
  `;
}

function formatearFecha(timestamp) {
  if (!timestamp) return "";
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

// 🔹 calcula y muestra los totales por estado
function actualizarResumen() {
  let pendientes = 0;
  let enProceso = 0;
  let resueltos = 0;

  reportesUsuario.forEach((item) => {
    const estadoTexto = (item.data.estado || "pendiente").toLowerCase();
    const estado = estadoTexto.replace(" ", "-"); // "en proceso" -> "en-proceso"

    if (estado === "pendiente") pendientes++;
    else if (estado === "en-proceso") enProceso++;
    else if (estado === "resuelto") resueltos++;
  });

  if (resumenPendienteEl) {
    resumenPendienteEl.textContent = `Pendientes: ${pendientes}`;
  }
  if (resumenEnprocesoEl) {
    resumenEnprocesoEl.textContent = `En proceso: ${enProceso}`;
  }
  if (resumenResueltoEl) {
    resumenResueltoEl.textContent = `Resueltos: ${resueltos}`;
  }
}

// 🔴 eliminar reporte (y sus imágenes si las tiene)
async function eliminarReporte(id, imagenes = []) {
  const confirmar = confirm(
    "¿Estás segura de eliminar este reporte? Esta acción no se puede deshacer."
  );
  if (!confirmar) return;

  try {
    // borrar imágenes en Storage (si se puede)
    for (const url of imagenes) {
      if (!url) continue;
      try {
        const imgRef = ref(storage, url);
        await deleteObject(imgRef);
      } catch (e) {
        // si falla borrar la imagen no rompemos todo
        console.warn("No se pudo borrar imagen:", e);
      }
    }

    // borrar documento en Firestore
    await deleteDoc(doc(db, "reportes", id));

    // sacar de la lista en memoria
    reportesUsuario = reportesUsuario.filter((r) => r.id !== id);

    // refrescar resumen + vista
    actualizarResumen();
    renderReportes(filtroEstadoSelect?.value || "todos");

    if (typeof window.mostrarAlerta === "function") {
      window.mostrarAlerta(
        "Reporte eliminado correctamente.",
        "success",
        { titulo: "Eliminado" }
      );
    } else {
      alert("Reporte eliminado correctamente.");
    }
  } catch (error) {
    console.error("Error al eliminar reporte:", error);
    if (typeof window.mostrarAlerta === "function") {
      window.mostrarAlerta(
        "No se pudo eliminar el reporte.",
        "danger",
        { titulo: "Error" }
      );
    } else {
      alert("No se pudo eliminar el reporte.");
    }
  }
}

function crearTarjetaReporte(id, data) {
  // columna
  const col = document.createElement("div");
  col.classList.add("col-12", "col-md-6", "col-lg-4");

  // tarjeta
  const card = document.createElement("article");
  card.classList.add("reporte-card");

  // header
  const header = document.createElement("div");
  header.classList.add("reporte-header");

  const tipoEl = document.createElement("div");
  tipoEl.classList.add("reporte-tipo");
  tipoEl.textContent = data.tipo || "Problema sin tipo";

  const estadoTexto = (data.estado || "pendiente").toLowerCase();
  const estadoClase = estadoTexto.replace(" ", "-"); // "en proceso" -> "en-proceso"

  const estadoEl = document.createElement("span");
  estadoEl.classList.add("reporte-estado", estadoClase);
  estadoEl.textContent = estadoTexto;

  header.appendChild(tipoEl);
  header.appendChild(estadoEl);

  // código de seguimiento
  const codigo = data.codigoSeguimiento || ("CR-" + id.substring(0, 6).toUpperCase());
  const codigoEl = document.createElement("p");
  codigoEl.classList.add("reporte-codigo");
  codigoEl.textContent = `Código: ${codigo}`;

  // click para copiar
  codigoEl.addEventListener("click", () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(codigo).then(() => {
        if (typeof window.mostrarAlerta === "function") {
          window.mostrarAlerta(
            "Código copiado al portapapeles.",
            "success",
            { titulo: "Copiado" }
          );
        }
      }).catch(() => {});
    }
  });

  // descripción
  const descEl = document.createElement("p");
  descEl.classList.add("reporte-descripcion");
  descEl.textContent = data.descripcion || "";

  // meta (ubicación, zona, fecha)
  const metaEl = document.createElement("p");
  metaEl.classList.add("reporte-meta");
  metaEl.textContent = `${data.ubicacion || "Sin ubicación"} · ${data.zona || "Zona sin especificar"} · ${formatearFecha(data.fecha)}`;

  card.appendChild(header);
  card.appendChild(codigoEl);
  card.appendChild(descEl);
  card.appendChild(metaEl);

  // 🔥 IMÁGENES (si existen)
  const imagenes = Array.isArray(data.imagenes) ? data.imagenes : [];

  if (imagenes.length > 0) {
    const contImgs = document.createElement("div");
    contImgs.classList.add("reporte-imgs");

    imagenes.forEach((url) => {
      if (!url) return;
      const img = document.createElement("img");
      img.src = url;
      img.alt = "Foto del incidente";
      img.addEventListener("click", () => {
        window.open(url, "_blank");
      });
      contImgs.appendChild(img);
    });

    card.appendChild(contImgs);
  }

  // 🔹 Acciones (Editar + Eliminar) solo si está pendiente
  if (estadoClase === "pendiente") {
    const actions = document.createElement("div");
    actions.classList.add("report-actions");

    // Botón Editar
    const btnEditar = document.createElement("button");
    btnEditar.type = "button";
    btnEditar.textContent = "Editar";
    btnEditar.classList.add("btn-edit");
    btnEditar.addEventListener("click", () => {
       localStorage.setItem("reporteId", id);
      window.location.href = `./editar-reporte.html?id=${id}`;
    });

    // Botón Eliminar
    const btnEliminar = document.createElement("button");
    btnEliminar.type = "button";
    btnEliminar.textContent = "Eliminar";
    btnEliminar.classList.add("btn-delete");
    btnEliminar.addEventListener("click", () => {
      eliminarReporte(id, imagenes);
    });

    actions.appendChild(btnEditar);
    actions.appendChild(btnEliminar);
    card.appendChild(actions);
  }

  col.appendChild(card);
  return col;
}

// pinta los reportes según el filtro elegido
function renderReportes(filtro = "todos") {
  if (!contenedor) return;

  contenedor.innerHTML = "";

  const listaFiltrada = reportesUsuario.filter((item) => {
    if (filtro === "todos") return true;

    const estadoTexto = (item.data.estado || "pendiente").toLowerCase();
    const estadoNormalizado = estadoTexto.replace(" ", "-");
    return estadoNormalizado === filtro;
  });

  if (listaFiltrada.length === 0) {
    if (sinReportesEl) sinReportesEl.style.display = "block";
    return;
  } else {
    if (sinReportesEl) sinReportesEl.style.display = "none";
  }

  listaFiltrada.forEach((item) => {
    const colCard = crearTarjetaReporte(item.id, item.data);
    contenedor.appendChild(colCard);
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!contenedor) return;

  if (!user) {
    if (typeof window.mostrarAlerta === "function") {
      window.mostrarAlerta(
        "Debes iniciar sesión para ver tus reportes.",
        "warn",
        { titulo: "Sesión requerida" }
      );
      setTimeout(() => {
        window.location.href = "./login.html";
      }, 800);
    } else {
      alert("Debes iniciar sesión para ver tus reportes.");
      window.location.href = "./login.html";
    }
    return;
  }

  mostrarMensajeCargando();

  try {
    const q = query(
      collection(db, "reportes"),
      where("usuarioId", "==", user.uid),
      orderBy("fecha", "desc")
    );

    const snap = await getDocs(q);

    reportesUsuario = [];

    snap.forEach((docSnap) => {
      reportesUsuario.push({
        id: docSnap.id,
        data: docSnap.data()
      });
    });

    if (reportesUsuario.length === 0) {
      contenedor.innerHTML = "";
      if (sinReportesEl) sinReportesEl.style.display = "block";
      actualizarResumen(); // pone todo en 0
      return;
    }

    // actualizar resumen y pintar todo al inicio
    actualizarResumen();
    renderReportes("todos");

  } catch (error) {
    console.error("Error al obtener reportes:", error);
    if (typeof window.mostrarAlerta === "function") {
      window.mostrarAlerta(
        "No se pudo cargar tus reportes.",
        "danger",
        { titulo: "Error" }
      );
    } else {
      alert("❌ Error al cargar tus reportes.");
    }
  }
});

// cuando cambie el select, volvemos a pintar
if (filtroEstadoSelect) {
  filtroEstadoSelect.addEventListener("change", () => {
    const valor = filtroEstadoSelect.value;
    renderReportes(valor);
  });
}
