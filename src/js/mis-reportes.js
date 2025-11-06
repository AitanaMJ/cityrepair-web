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

  // ✅ helpers para badges / iconos
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

  // ✅ escuchar estado de auth
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
        const d = docSnap.data();
        const fechaTxt = d.fecha?.toDate?.().toLocaleString() || "Sin fecha";
        const [badgeCls, badgeTxt] = estadoBadge(d.estado);
        const icon = tipoIcon(d.tipo);

        // 👇 si existen fotos, armamos la grilla
        let fotosHtml = "";
        if (Array.isArray(d.fotos) && d.fotos.length > 0) {
          const thumbs = d.fotos
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

        // zona opcional
        const zonaHtml = d.zona
          ? `<p><b>Zona:</b> ${d.zona}</p>`
          : "";

        cont.innerHTML += `
          <div class="card card-reporte">
            <div class="card-body">
              <div class="info">
                <h5><i class="bi ${icon}"></i> ${d.tipo || "Reporte"}</h5>
                <p><b>Ubicación:</b> ${d.ubicacion || d.direccion || "-"}</p>
                ${zonaHtml}
                <p><b>Descripción:</b> ${d.descripcion || "-"}</p>
                <small class="muted"><b>Fecha:</b> ${fechaTxt}</small>
                ${fotosHtml}
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