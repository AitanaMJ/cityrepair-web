// src/js/edet.js
import { auth } from './firebase.js';
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

/* ------------------------------------------------------------------
   1. Configuración: quiénes son admins EDET
   ------------------------------------------------------------------ */
const ADMIN_EMAILS = [
  "edet@cityrepair.com",
  "admin@edet.com"
  // agregá acá los que quieras habilitar
];

/* ------------------------------------------------------------------
   2. Función de guardia: sólo admins pueden ver el dashboard
   ------------------------------------------------------------------ */
function protectDashboard() {
  onAuthStateChanged(auth, (user) => {
    // no logueado
    if (!user) {
      window.location.replace("./edet-login.html");
      return;
    }

    // logueado pero NO está en la lista de admins
    if (!ADMIN_EMAILS.includes(user.email)) {
      // opcional: mostrar un toast si tenés window.mostrarAlerta
      window.mostrarAlerta?.("No tienes permiso para este panel", "danger", { titulo: "Acceso denegado" });
      // cerrar sesión para no dejarlo con la sesión de admin
      signOut(auth);
      window.location.replace("./edet-login.html");
      return;
    }

    // si llegó acá, es admin ✔
    initDashboard(user);
  });
}

/* ------------------------------------------------------------------
   3. Lógica del dashboard (lo que ya tenías)
   ------------------------------------------------------------------ */

// datos demo, los dejé igual que en tu archivo
const DEMO = [
  { id:8742, titulo:'Corte de luz',       lugar:'Av. Libertador 1234',     estado:'revision',  prioridad:'alta',  fecha:'14/1/2024', zona:'Centro' },
  { id:8739, titulo:'Alumbrado público',  lugar:'Plaza Central',           estado:'resuelto',  prioridad:'baja',  fecha:'11/1/2024', zona:'Centro' },
  { id:8738, titulo:'Transformador',      lugar:'Barrio Sur, Calle 12',    estado:'revision',  prioridad:'alta',  fecha:'10/1/2024', zona:'Sur' },
  { id:8737, titulo:'Medidor dañado',     lugar:'Av. Rivadavia 890',       estado:'pendiente', prioridad:'media', fecha:'9/1/2024',  zona:'Este' },
];

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

function badgeEstado(e){
  const map = {
    pendiente:['Pendiente','#f59e0b'],
    revision:['En Revisión','#3b82f6'],
    resuelto:['Resuelto','#10b981']
  };
  const [txt,col] = map[e] || ['-','#9ca3af'];
  return `<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:${col}20;color:${col}">${txt}</span>`;
}

function badgePrio(p){
  const map = {
    alta:['Alta','#ef4444'],
    media:['Media','#f59e0b'],
    baja:['Baja','#64748b']
  };
  const [txt,col] = map[p] || ['-','#9ca3af'];
  return `<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:${col}20;color:${col}">${txt}</span>`;
}

function pintarTabla(list){
  const tbl = document.getElementById('tbl');
  if (!tbl) return;
  const rows = list.map(r => `
    <tr class="row-card">
      <td><b>#${r.id}</b><div class="muted">${r.fecha}</div></td>
      <td><b>${r.titulo}</b><div class="muted"><i class="bi bi-geo-alt"></i> ${r.lugar}</div></td>
      <td>${badgeEstado(r.estado)}</td>
      <td>${badgePrio(r.prioridad)}</td>
      <td><button class="btn btn-outline">Resolver</button></td>
    </tr>
  `).join('');
  tbl.innerHTML = `
    <thead>
      <tr><th>Reporte</th><th>Tipo/Ubicación</th><th>Estado</th><th>Prioridad</th><th>Acciones</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  `;
}

function filtrar(){
  const q = (document.getElementById('q')?.value || '').toLowerCase();
  const e = document.getElementById('fEstado')?.value || '';
  const p = document.getElementById('fPrioridad')?.value || '';
  let list = DEMO.filter(r =>
    (!q || r.titulo.toLowerCase().includes(q) || r.lugar.toLowerCase().includes(q) || String(r.id).includes(q)) &&
    (!e || r.estado===e) &&
    (!p || r.prioridad===p)
  );
  pintarKPIs(list);
  pintarTabla(list);
}

/* ------------------------------------------------------------------
   4. Inicio real del dashboard una vez que sabemos que es admin
   ------------------------------------------------------------------ */
function initDashboard(user){
  // mostrar “Bienvenido …” si existe el elemento
  const welcome = document.getElementById('welcome');
  if (welcome) {
    welcome.textContent = `Bienvenido/a ${user.email}`;
  }

  // pintar datos demo
  pintarKPIs(DEMO);
  pintarTabla(DEMO);

  // filtros
  ['q','fEstado','fPrioridad'].forEach(id =>
    document.getElementById(id)?.addEventListener('input', filtrar)
  );

  // botón cerrar sesión
  document.getElementById('btnSalir')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
    window.location.replace("./edet-login.html");
  });
}

/* ------------------------------------------------------------------
   5. Arrancar cuando cargue la página
   ------------------------------------------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  // sólo tiene sentido en el dashboard
  if (location.pathname.endsWith("edet-dashboard.html")) {
    protectDashboard();
  }
});
