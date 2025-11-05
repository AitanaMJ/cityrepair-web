import { auth, db } from "./firebase.js";
import {
  collection, query, where, orderBy, getDocs
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const cont = document.getElementById("lista-reportes");
  if (!cont) return;

// flash opcional usando el toast de app.js
const flash = sessionStorage.getItem("flash");
if (flash) {
  // usa el toast global definido en app.js
  if (typeof mostrarAlerta === "function") {
    mostrarAlerta(flash, "success", { titulo: "Reporte enviado" });
  }
  sessionStorage.removeItem("flash");
}


  const estadoBadge = (estadoRaw) => {
    const e = (estadoRaw || "").toLowerCase();
    if (e === "resuelto") return ['status-badge status-resuelto', 'Resuelto'];
    if (e === "en proceso" || e === "proceso") return ['status-badge status-proceso', 'En proceso'];
    return ['status-badge status-pendiente', 'Pendiente'];
  };

  const tipoIcon = (tipoRaw) => {
    const t = (tipoRaw || "").toLowerCase();
    if (t.includes("corte")) return "bi-lightning";
    if (t.includes("poste")) return "bi-lightning-charge";
    if (t.includes("cable")) return "bi-plug";
    return "bi-flag";
    // podés mapear más íconos si querés
  };

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

      cont.innerHTML = ""; // limpiar lista

      snap.forEach((doc) => {
        const d = doc.data();
        const fechaTxt = d.fecha?.toDate?.().toLocaleString() || "Sin fecha";
        const [badgeCls, badgeTxt] = estadoBadge(d.estado);
        const icon = tipoIcon(d.tipo);

        cont.innerHTML += `
          <div class="card">
            <div class="card-body">
              <div class="info">
                <h5><i class="bi ${icon}"></i> ${d.tipo || "Reporte"}</h5>
                <p><b>Ubicación:</b> ${d.ubicacion || d.direccion || "-"}</p>
                <p><b>Descripción:</b> ${d.descripcion || "-"}</p>
                <small class="muted"><b>Fecha:</b> ${fechaTxt}</small>
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
