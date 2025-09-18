// src/js/edet.js
import { setAuth, getAuth, findUserByEmail, saveUser, requireRole, logoutTo } from './auth.js';

/* ---------- Utils validación corporativa ---------- */
const emailOK = (email) => /@edet\.com\.ar$/i.test(email);
const eidOK   = (eid)   => /^EDET-\d{5,6}$/i.test(eid);

/* ---------- LOGIN ---------- */
document.getElementById('edetLoginForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('edetEmail').value.trim();
  const pass  = document.getElementById('edetPass').value.trim();

  if (!emailOK(email)) { alert('Usá tu email corporativo @edet.com.ar'); return; }
  if (pass.length < 6) { alert('La contraseña debe tener al menos 6 caracteres'); return; }

  const u = findUserByEmail(email) || { name: 'Empleado', surname: '', eid: 'EDET-00000', depto: '—' };
  // (en demo no validamos pass contra “BD”, sólo formato)
  setAuth({ role:'edet', email, name: u.name, surname: u.surname, eid: u.eid, depto: u.depto });
  window.location.replace('./edet-dashboard.html');
});

/* ---------- REGISTRO ---------- */
document.getElementById('edetRegisterForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = {
    name:    document.getElementById('rNombre').value.trim(),
    surname: document.getElementById('rApellido').value.trim(),
    eid:     document.getElementById('rEid').value.trim(),
    depto:   document.getElementById('rDepto').value.trim(),
    tel:     document.getElementById('rTel').value.trim(),
    email:   document.getElementById('rEmail').value.trim(),
    pass:    document.getElementById('rPass').value.trim(),
  };

  if (!data.name || !data.surname || !data.depto) { alert('Completá todos los datos obligatorios'); return; }
  if (!emailOK(data.email)) { alert('Email corporativo inválido'); return; }
  if (!eidOK(data.eid))     { alert('ID de empleado inválido. Usa formato EDET-001234'); return; }
  if (data.pass.length < 6) { alert('Contraseña mínima: 6 caracteres'); return; }

  if (findUserByEmail(data.email)) { alert('Ya existe un usuario con ese email'); return; }

  saveUser(data);
  setAuth({ role:'edet', email:data.email, name:data.name, surname:data.surname, eid:data.eid, depto:data.depto });
  window.location.replace('./edet-dashboard.html');
});

/* ---------- DASHBOARD (datos DEMO) ---------- */
const DEMO = [
  { id:8742, titulo:'Corte de luz', lugar:'Av. Libertador 1234', estado:'revision', prioridad:'alta',  fecha:'14/1/2024', zona:'Centro' },
  { id:8739, titulo:'Alumbrado público', lugar:'Plaza Central',     estado:'resuelto', prioridad:'baja', fecha:'11/1/2024', zona:'Centro' },
  { id:8738, titulo:'Transformador',   lugar:'Barrio Sur, Calle 12',estado:'revision', prioridad:'alta', fecha:'10/1/2024', zona:'Sur' },
  { id:8737, titulo:'Medidor dañado',  lugar:'Av. Rivadavia 890',   estado:'pendiente',prioridad:'media',fecha:'9/1/2024',  zona:'Este' },
];

function pintarKPIs(list){
  const total = list.length;
  const res   = list.filter(x=>x.estado==='resuelto').length;
  const rev   = list.filter(x=>x.estado==='revision').length;
  const alta  = list.filter(x=>x.prioridad==='alta').length;
  const $ = (id)=>document.getElementById(id);
  $('#kTotal')    && ($('#kTotal').textContent = total);
  $('#kResueltos')&& ($('#kResueltos').textContent = res);
  $('#kRevision') && ($('#kRevision').textContent = rev);
  $('#kAlta')     && ($('#kAlta').textContent = alta);
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
function badgeEstado(e){
  const map = { pendiente:['Pendiente','#f59e0b'], revision:['En Revisión','#3b82f6'], resuelto:['Resuelto','#10b981'] };
  const [txt,col] = map[e] || ['-','#9ca3af'];
  return `<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:${col}20;color:${col}">${txt}</span>`;
}
function badgePrio(p){
  const map = { alta:['Alta','#ef4444'], media:['Media','#f59e0b'], baja:['Baja','#64748b'] };
  const [txt,col] = map[p] || ['-','#9ca3af'];
  return `<span style="display:inline-block;padding:4px 8px;border-radius:999px;background:${col}20;color:${col}">${txt}</span>`;
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

/* bootstrap del dashboard */
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('welcome')) {
    requireRole('edet', './edet-login.html');
    const u = getAuth();
    document.getElementById('welcome').textContent =
      `Bienvenido/a ${u?.name || 'Empleado'} (${u?.eid || ''} · ${u?.depto || ''})`;
    pintarKPIs(DEMO);
    pintarTabla(DEMO);
    ['q','fEstado','fPrioridad'].forEach(id => document.getElementById(id)?.addEventListener('input', filtrar));
    document.getElementById('btnSalir')?.addEventListener('click', (e)=>{ e.preventDefault(); logoutTo('../index.html'); });
  }
});
