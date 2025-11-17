// src/js/tecnico-dashboard.js
import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const listaEl       = document.getElementById("lista-tecnico");
const kpiAsignados  = document.getElementById("kpiAsignados");
const kpiRevision   = document.getElementById("kpiRevision");
const kpiResueltos  = document.getElementById("kpiResueltos");

/* ---------- Helpers ---------- */
function badgeEstado(estado = "pendiente") {
  const e = estado.toLowerCase();
  if (e === "resuelto")
    return `<span class="tag tag--green"><i class="bi bi-check2-circle"></i> Resuelto</span>`;
  if (e.includes("rev"))
    return `<span class="tag tag--blue"><i class="bi bi-hourglass-split"></i> En revisión</span>`;
  return `<span class="tag tag--blue"><i class="bi bi-hourglass-split"></i> Pendiente</span>`;
}

function badgePrioridad(p = "baja") {
  const pp = (p || "").toLowerCase();
  if (pp === "alta")
    return `<span class="tag tag--red"><i class="bi bi-exclamation-triangle"></i> Alta</span>`;
  if (pp === "media")
    return `<span class="tag tag--yellow"><i class="bi bi-exclamation-diamond"></i> Media</span>`;
  return `<span class="tag tag--gray"><i class="bi bi-dot"></i> Baja</span>`;
}

function formatearFecha(ts) {
  if (!ts) return "";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/* ---------- Auth + carga de reportes ---------- */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "./edet-login.html";
    return;
  }

  // (Opcional) chequeo de rol
  try {
    const snapUser = await getDoc(doc(db, "usuarios", user.uid));
    const dataUser = snapUser.data() || {};
    if (dataUser.rol && dataUser.rol !== "tecnico") {
      // si no es técnico, lo echo al dashboard admin o al inicio
      window.location.href = "./edet-dashboard.html";
      return;
    }
  } catch (e) {
    console.warn("No se pudo comprobar rol del usuario:", e);
  }

  // Escuchamos SOLO los reportes asignados a este técnico
  const qRep = query(
    collection(db, "reportes"),
    where("tecnicoEmail", "==", user.email.toLowerCase())
  );

  onSnapshot(qRep, (snap) => {
    const reportes = [];
    snap.forEach((d) => reportes.push({ id: d.id, ...d.data() }));
    renderReportes(reportes);
    actualizarKPIs(reportes);
  });
});

/* ---------- Render ---------- */
function renderReportes(reportes = []) {
  if (!listaEl) return;

  if (reportes.length === 0) {
    listaEl.innerHTML = `<p class="muted" style="padding:14px 18px;">No tenés reportes asignados.</p>`;
    return;
  }

  listaEl.innerHTML = reportes.map((r) => {
    const fecha = formatearFecha(r.fecha);
    const codigo = r.codigoSeguimiento || ("CR-" + r.id.slice(0, 6).toUpperCase());

    return `
      <div class="list-row card-reporte-tec" data-id="${r.id}">
        <div>
          <div class="rep-code">#${codigo}</div>
          <div class="rep-date">
            <i class="bi bi-calendar"></i> ${fecha || "Sin fecha"}
          </div>
        </div>

        <div>
          <div class="rep-title">${r.tipo || "Reporte"}</div>
          <div class="rep-loc">
            <i class="bi bi-geo-alt"></i> ${r.ubicacion || "Sin dirección"}
          </div>
        </div>

        <div>${badgeEstado(r.estado || "pendiente")}</div>
        <div>${badgePrioridad(r.prioridad || "baja")}</div>

        <div class="ta-right">
          <button class="btn-resolver-estado" data-estado="en revisión">
            <i class="bi bi-hourglass-split"></i> En revisión
          </button>
          <button class="btn-resolver-estado" data-estado="resuelto">
            <i class="bi bi-check2"></i> Marcar resuelto
          </button>
        </div>
      </div>
    `;
  }).join("");

  listaEl.querySelectorAll(".btn-resolver-estado").forEach((btn) => {
    btn.addEventListener("click", onCambiarEstadoClick);
  });
}

/* ---------- Cambiar estado ---------- */
async function onCambiarEstadoClick(e) {
  const btn = e.currentTarget;
  const row = btn.closest(".card-reporte-tec");
  const id = row.dataset.id;
  const nuevoEstado = btn.dataset.estado;

  let nota = "";
  if (nuevoEstado === "resuelto") {
    nota = prompt("Nota para el ciudadano (opcional):\nEj: Se reemplazó el transformador.");
  }

  try {
    await updateDoc(doc(db, "reportes", id), {
      estado: nuevoEstado,
      notaResolucion: nota || "",
      fechaResuelto: nuevoEstado === "resuelto" ? new Date() : null
    });

    window.mostrarAlerta?.("Estado actualizado", "success", {
      titulo: "Actualizado"
    });
  } catch (err) {
    console.error(err);
    window.mostrarAlerta?.("No se pudo actualizar el reporte", "danger", {
      titulo: "Error"
    });
  }
}

/* ---------- KPIs ---------- */
function actualizarKPIs(reportes = []) {
  const total       = reportes.length;
  const revision    = reportes.filter(r => (r.estado || "").toLowerCase().includes("rev")).length;
  const resueltos   = reportes.filter(r => (r.estado || "").toLowerCase() === "resuelto").length;

  if (kpiAsignados) kpiAsignados.textContent = total;
  if (kpiRevision)  kpiRevision.textContent  = revision;
  if (kpiResueltos) kpiResueltos.textContent = resueltos;
}
