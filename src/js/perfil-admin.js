// perfil-admin.js
const API = "http://localhost:3000/api";

document.addEventListener("DOMContentLoaded", async () => {
  const session = JSON.parse(localStorage.getItem("cr_auth") || "null");
  if (!session || session.role !== "admin") {
    window.location.href = "./login.html";
    return;
  }

  const email    = session.email || "admin@edet.com";
  const nombre   = session.nombre || email.split("@")[0] || "Admin";
  const iniciales = nombre.trim().split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setEl("perfilNombre", nombre);
  setEl("perfilEmail",  email);
  setEl("infoNombre",   nombre);
  setEl("infoEmail",    email);
  setEl("infoUid",      session.id || "local-user");
  const avatarEl = document.getElementById("perfilAvatar");
  if (avatarEl) avatarEl.textContent = iniciales;

  // Stats
  try {
    const res  = await fetch(`${API}/reportes`);
    const data = await res.json();
    if (res.ok && Array.isArray(data)) {
      setEl("statTotal",      data.length);
      setEl("statPendientes", data.filter(r => (r.estado||"").toLowerCase() === "pendiente").length);
      setEl("statRevision",   data.filter(r => (r.estado||"").toLowerCase().includes("rev")).length);
      setEl("statResueltos",  data.filter(r => (r.estado||"").toLowerCase() === "resuelto").length);
    }
  } catch(e) { console.error(e); }

  // Cargar técnicos
  await cargarTecnicos();

  // Cerrar sesión
  const logout = () => { localStorage.removeItem("cr_auth"); window.location.href = "./login.html"; };
  document.getElementById("btnLogoutPerfil")?.addEventListener("click", logout);
  document.getElementById("btnLogoutNav")?.addEventListener("click", logout);

  // Dar de baja cuenta admin
  document.getElementById("btnDarBaja")?.addEventListener("click", () => darDeBaja(session.id, true));
});

async function cargarTecnicos() {
  const contenedor = document.getElementById("listaTecnicos");
  if (!contenedor) return;

  try {
    const res  = await fetch(`${API}/tecnicos/todos`);
    const data = await res.json();

    if (!res.ok || !Array.isArray(data) || data.length === 0) {
      contenedor.innerHTML = `<p class="admin-loading-txt">No hay técnicos registrados.</p>`;
      return;
    }

    contenedor.innerHTML = data.map(t => {
      const activo = t.activo !== 0;
      return `
        <div class="tec-row" id="tec-row-${t.id}">
          <div class="tec-row-info">
            <div class="tec-row-avatar">${t.email[0].toUpperCase()}</div>
            <div>
              <p class="tec-row-email">${t.email}</p>
              <span class="tec-row-badge ${activo ? "badge-activo" : "badge-inactivo"}">
                ${activo ? "✅ Activo" : "🚫 Desactivado"}
              </span>
            </div>
          </div>
          <button
            class="tec-row-btn ${activo ? "btn-desactivar" : "btn-reactivar"}"
            onclick="toggleTecnico(${t.id}, ${activo ? 0 : 1}, '${t.email}')">
            ${activo ? "Dar de baja" : "Reactivar"}
          </button>
        </div>`;
    }).join("");
  } catch(e) {
    contenedor.innerHTML = `<p class="admin-loading-txt" style="color:#dc2626">Error cargando técnicos.</p>`;
  }
}

window.toggleTecnico = async function(id, nuevoEstado, email) {
  const accion = nuevoEstado === 0 ? "desactivar" : "reactivar";
  if (!confirm(`¿Estás seguro que querés ${accion} la cuenta de ${email}?`)) return;

  try {
    const res = await fetch(`${API}/usuarios/${id}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: nuevoEstado })
    });
    if (!res.ok) throw new Error();
    await cargarTecnicos(); // refrescar lista
    alert(`✅ Cuenta ${nuevoEstado === 0 ? "desactivada" : "reactivada"} correctamente.`);
  } catch {
    alert("❌ Error al actualizar la cuenta.");
  }
};

async function darDeBaja(userId, esAdmin) {
  const confirm1 = confirm("¿Estás seguro que querés dar de baja tu propia cuenta?\nNo podrás iniciar sesión hasta que otro administrador la reactive.");
  if (!confirm1) return;

  try {
    const res = await fetch(`${API}/usuarios/${userId}/estado`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: 0 })
    });
    if (!res.ok) throw new Error();
    alert("Tu cuenta ha sido desactivada.");
    localStorage.removeItem("cr_auth");
    window.location.href = "./login.html";
  } catch {
    alert("❌ Error al dar de baja la cuenta.");
  }
}