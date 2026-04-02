// src/js/edet.js

/* ------------------------------------------------------------------
   1. Función para obtener sesión actual
------------------------------------------------------------------ */
function getSession() {
  return JSON.parse(localStorage.getItem("session"));
}

/* ------------------------------------------------------------------
   2. Guardia: sólo rol "admin" o "edet"
------------------------------------------------------------------ */
function protectDashboard() {
  const session = getSession();

  if (!session) {
    window.location.replace("./edet-login.html");
    return;
  }

  const rol = (session.rol || "").toLowerCase();

  if (rol !== "admin" && rol !== "edet") {
    window.mostrarAlerta?.(
      "No tienes permiso para este panel",
      "danger",
      { titulo: "Acceso denegado" }
    );

    localStorage.removeItem("session");

    setTimeout(() => {
      window.location.replace("./edet-login.html");
    }, 800);

    return;
  }

  initDashboard(session);
}

/* ------------------------------------------------------------------
   3. Datos demo
------------------------------------------------------------------ */
const DEMO = [
  { id:8742, titulo:'Corte de luz', lugar:'Av. Libertador 1234', estado:'revision', prioridad:'alta', fecha:'14/1/2024', zona:'Centro' },
  { id:8739, titulo:'Alumbrado público', lugar:'Plaza Central', estado:'resuelto', prioridad:'baja', fecha:'11/1/2024', zona:'Centro' },
  { id:8738, titulo:'Transformador', lugar:'Barrio Sur, Calle 12', estado:'revision', prioridad:'alta', fecha:'10/1/2024', zona:'Sur' },
  { id:8737, titulo:'Medidor dañado', lugar:'Av. Rivadavia 890', estado:'pendiente', prioridad:'media', fecha:'9/1/2024', zona:'Este' },
];

/* ------------------------------------------------------------------
   4. Dashboard
------------------------------------------------------------------ */

function pintarKPIs(list){
  const total = list.length;
  const res   = list.filter(x=>x.estado==='resuelto').length;
  const rev   = list.filter(x=>x.estado==='revision').length;
  const alta  = list.filter(x=>x.prioridad==='alta').length;

  const $ = (id)=>document.getElementById(id);

  $('#kTotal')     && ($('#kTotal').textContent     = total);
  $('#kResueltos') && ($('#kResueltos').textContent = res);
  $('#kRevision')  && ($('#kRevision').textContent  = rev);
  $('#kAlta')      && ($('#kAlta').textContent      = alta);
}

function pintarTabla(list){
  const tbl = document.getElementById('tbl');
  if (!tbl) return;

  const rows = list.map(r => `
    <tr>
      <td><b>#${r.id}</b><div class="muted">${r.fecha}</div></td>
      <td><b>${r.titulo}</b><div class="muted">${r.lugar}</div></td>
      <td>${r.estado}</td>
      <td>${r.prioridad}</td>
      <td><button class="btn btn-outline">Resolver</button></td>
    </tr>
  `).join('');

  tbl.innerHTML = `
    <thead>
      <tr>
        <th>Reporte</th>
        <th>Tipo/Ubicación</th>
        <th>Estado</th>
        <th>Prioridad</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  `;
}

function initDashboard(session){
  const welcome = document.getElementById('welcome');
  if (welcome) {
    welcome.textContent = `Bienvenido/a ${session.email}`;
  }

  pintarKPIs(DEMO);
  pintarTabla(DEMO);

  document.getElementById('btnSalir')?.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem("session");
    window.location.replace("./edet-login.html");
  });
}

/* ------------------------------------------------------------------
   5. Inicialización
------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  if (location.pathname.endsWith("edet-dashboard.html")) {
    protectDashboard();
  }
});