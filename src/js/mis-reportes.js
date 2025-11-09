// src/js/mis-reportes.js
import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const cont = document.getElementById("lista-reportes");
  if (!cont) return;

  // ---- Flash opcional (cuando venís de reportar) ----
  const flash = sessionStorage.getItem("flash");
  if (flash) {
    if (typeof window.mostrarAlerta === "function") {
      window.mostrarAlerta(flash, "success", { titulo: "Reporte enviado" });
    }
    sessionStorage.removeItem("flash");
  }

  // ✅ Helpers para badges / iconos
  const estadoBadge = (estadoRaw) => {
    const e = (estadoRaw || "").toLowerCase();
    if (e === "resuelto") return ["status-badge status-resuelto", "Resuelto"];
    if (e.includes("rev")) return ["status-badge status-proceso", "En revisión"];
    if (e === "en proceso" || e === "proceso") return ["status-badge status-proceso", "En proceso"];
    return ["status-badge status-pendiente", "Pendiente"];
  };

  const tipoIcon = (tipoRaw) => {
    const t = (tipoRaw || "").toLowerCase();
    if (t.includes("corte")) return "bi-lightning";
    if (t.includes("poste")) return "bi-lightning-charge";
    if (t.includes("cable")) return "bi-plug";
    return "bi-flag";
  };

  // ✅ Escuchar estado de sesión
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      cont.innerHTML = `<p class="text-center text-muted mt-5">Inicia sesión para ver tus reportes.</p>`;
      return;
    }

    cont.innerHTML = `<p class="text-center text-muted mt-5">Cargando reportes...</p>`;

    try {
      const q = query(
        collection(db, "reportes"),
        where("usuarioId", "==", user.uid),
        orderBy("fecha", "desc")
      );
      const snap = await getDocs(q);

      if (snap.empty) {
        cont.innerHTML = `<p class="text-center text-muted mt-5">No tienes reportes aún.</p>`;
        return;
      }

      cont.innerHTML = ""; // limpiar contenedor

      snap.forEach((docSnap) => {
        const reporte = docSnap.data();
        const fechaTxt = reporte.fecha?.toDate?.().toLocaleString("es-AR") || "Sin fecha";
        const [badgeCls, badgeTxt] = estadoBadge(reporte.estado);
        const icon = tipoIcon(reporte.tipo);

        // 👇 Si existen fotos, armamos la grilla
        let fotosHtml = "";
        if (Array.isArray(reporte.fotos) && reporte.fotos.length > 0) {
          const thumbs = reporte.fotos
            .map(
              (url) => `
              <a href="${url}" target="_blank" class="reporte-thumb">
                <img src="${url}" alt="foto reporte">
              </a>
            `
            )
            .join("");
          fotosHtml = `
            <div class="reporte-fotos">
              <p class="muted" style="margin-bottom:4px;">Fotos del reporte:</p>
              <div class="reporte-fotos-grid">
                ${thumbs}
              </div>
            </div>
          `;
        }

        // 🟢 Mostrar detalle si el reporte está resuelto
        let resolucionHtml = "";
        if (reporte.estado === "resuelto") {
          const fechaResuelto = reporte.fechaResuelto
            ? new Date(reporte.fechaResuelto.seconds * 1000).toLocaleString("es-AR")
            : "Fecha no disponible";

          const nota = reporte.notaResolucion || "El reporte fue marcado como resuelto por EDET.";

          resolucionHtml = `
            <div class="reporte-resuelto">
              <strong>✅ Problema resuelto</strong>
              <small>Fecha: ${fechaResuelto}</small>
              <p>${nota}</p>
            </div>
          `;
        }

        // Zona opcional
        const zonaHtml = reporte.zona ? `<p><b>Zona:</b> ${reporte.zona}</p>` : "";

        // 🔹 Render final
        cont.innerHTML += `
          <div class="card card-reporte">
            <div class="card-body">
              <div class="info">
                <h5><i class="bi ${icon}"></i> ${reporte.tipo || "Reporte"}</h5>
                <p><b>Ubicación:</b> ${reporte.ubicacion || reporte.direccion || "-"}</p>
                ${zonaHtml}
                <p><b>Descripción:</b> ${reporte.descripcion || "-"}</p>
                <small class="muted"><b>Fecha:</b> ${fechaTxt}</small>
                ${fotosHtml}
                ${resolucionHtml}
              </div>
              <div class="status">
                <span class="${badgeCls}">${badgeTxt}</span>
              </div>
            </div>
          </div>
        `;
      });
    } catch (err) {
      console.error("Error al obtener reportes:", err);
      cont.innerHTML = `<p class="text-center text-danger mt-5">Error al cargar tus reportes.</p>`;
    }
  });
});
