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
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const listaEl       = document.getElementById("lista-tecnico");
const kpiAsignados  = document.getElementById("kpiAsignados");
const kpiRevision   = document.getElementById("kpiRevision");
const kpiResueltos  = document.getElementById("kpiResueltos");

/* ---------- Helpers ---------- */
function badgeEstado(estado = "pendiente") {
  const e = (estado || "").toLowerCase();
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
      // si no es técnico, lo mando al dashboard admin
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
    listaEl.innerHTML = `
      <p class="muted" style="padding:14px 18px;">
        No tenés reportes asignados.
      </p>`;
    return;
  }

  listaEl.innerHTML = reportes
    .map((r) => {
      const fecha       = formatearFecha(r.fecha);
      const codigo      =
        r.codigoSeguimiento || "CR-" + r.id.slice(0, 6).toUpperCase();
      const descripcion = r.descripcion || "";
      const nota        = r.notaResolucion || "";
      const prioridad   = r.prioridad || "baja";

      // imágenes (si hay)
      const imagenes = Array.isArray(r.imagenes) ? r.imagenes : [];

      const htmlImagenes =
        imagenes.length > 0
          ? `
        <div class="reporte-imgs-tec">
          ${imagenes
            .map((url) => {
              if (!url) return "";
              return `
                <img src="${url}"
                     alt="Foto del incidente"
                     class="thumb-tec"
                     data-url="${url}" />
              `;
            })
            .join("")}
        </div>
      `
          : "";

      const htmlNota = nota
        ? `
        <p class="tec-nota">
          <strong>Nota actual:</strong> ${nota}
        </p>
      `
        : "";

      return `
        <div class="list-row card-reporte-tec" data-id="${r.id}">
          <div>
            <div class="rep-code" data-code="${codigo}">
              #${codigo}
            </div>
            <div class="rep-date">
              <i class="bi bi-calendar"></i> ${fecha || "Sin fecha"}
            </div>
          </div>

          <div>
            <div class="rep-title">${r.tipo || "Reporte"}</div>
            <div class="rep-loc">
              <i class="bi bi-geo-alt"></i>
              ${r.ubicacion || "Sin dirección"}
            </div>
            <p class="rep-desc-tec">${descripcion}</p>
            ${htmlNota}
          </div>

          <div>${badgeEstado(r.estado || "pendiente")}</div>
          <div>${badgePrioridad(prioridad)}</div>

          <div class="tec-imgs-wrapper">
            ${htmlImagenes}
          </div>

          <div class="acciones-tec">
            <button class="btn-resolver-estado" data-estado="en revisión">
              <i class="bi bi-hourglass-split"></i> En revisión
            </button>
            <button class="btn-resolver-estado" data-estado="resuelto">
              <i class="bi bi-check2"></i> Marcar resuelto
            </button>
          </div>
        </div>
      `;
    })
    .join("");

  // Eventos para cambiar estado
  listaEl.querySelectorAll(".btn-resolver-estado").forEach((btn) => {
    btn.addEventListener("click", onCambiarEstadoClick);
  });

  // Evento para abrir imagen en otra pestaña
  listaEl.querySelectorAll(".thumb-tec").forEach((img) => {
    img.addEventListener("click", () => {
      const url = img.dataset.url;
      if (url) window.open(url, "_blank");
    });
  });

  // Evento para copiar código de seguimiento
  listaEl.querySelectorAll(".rep-code").forEach((codeEl) => {
    codeEl.addEventListener("click", async () => {
      const code = codeEl.dataset.code;
      if (!code) return;
      try {
        await navigator.clipboard?.writeText(code);
        window.mostrarAlerta?.("Código copiado al portapapeles.", "success", {
          titulo: "Copiado"
        });
      } catch (err) {
        console.warn("No se pudo copiar el código:", err);
      }
    });
  });
}

/* ---------- Cambiar estado ---------- */
async function onCambiarEstadoClick(e) {
  const btn         = e.currentTarget;
  const row         = btn.closest(".card-reporte-tec");
  const id          = row.dataset.id;
  const nuevoEstado = btn.dataset.estado;

  let nota = "";
  if (nuevoEstado === "resuelto") {
    nota = prompt(
      "Nota para el ciudadano (opcional):\nEj: Se reemplazó el transformador."
    );
  }

  try {
    await updateDoc(doc(db, "reportes", id), {
      estado: nuevoEstado,
      notaResolucion:
        nota ||
        (nuevoEstado === "resuelto"
          ? "El reporte fue marcado como resuelto."
          : ""),
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
  const total     = reportes.length;
  const revision  = reportes.filter(
    (r) => (r.estado || "").toLowerCase().includes("rev")
  ).length;
  const resueltos = reportes.filter(
    (r) => (r.estado || "").toLowerCase() === "resuelto"
  ).length;

  if (kpiAsignados) kpiAsignados.textContent = total;
  if (kpiRevision)  kpiRevision.textContent  = revision;
  if (kpiResueltos) kpiResueltos.textContent = resueltos;
}

/* ---------- Mini menú del Técnico (Perfil / Cerrar sesión) ---------- */
const btnMenuTec = document.getElementById("btnTecnicoMenu");
const dropTec    = document.getElementById("tecnicoDropdown");
const btnPerfil  = document.getElementById("tecnicoPerfil");
const btnLogout  = document.getElementById("tecnicoLogout");

// abrir/cerrar menú
btnMenuTec?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!dropTec) return;
  dropTec.hidden = !dropTec.hidden;
});

// cerrar si hace click fuera
document.addEventListener("click", (e) => {
  if (!dropTec || dropTec.hidden) return;
  if (!btnMenuTec?.contains(e.target) && !dropTec.contains(e.target)) {
    dropTec.hidden = true;
  }
});

// Ver perfil del técnico (usa la misma página de perfil general)
btnPerfil?.addEventListener("click", () => {
  window.location.href = "./perfil.html";
});

// Cerrar sesión
btnLogout?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    window.location.href = "./edet-login.html";
  } catch (err) {
    console.error("Error al cerrar sesión del técnico:", err);
    window.mostrarAlerta?.("No se pudo cerrar sesión", "danger", {
      titulo: "Error"
    });
  }
});
