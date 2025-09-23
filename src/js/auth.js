// ---------- src/js/auth.js ----------
const AUTH_KEY = 'cr_auth';
const USERS_KEY = 'cr_edet_users'; // opcional: “BD” demo para empleados EDET

// A dónde debe ir cada rol cuando entra
export const HOME = {
  citizen: '/index.html',
  edet: '/pages/edet-dashboard.html',
  admin: '/pages/edet-dashboard.html',
};

export function setAuth(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ ...user, ts: Date.now() }));
}
export function getAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); }
  catch { return null; }
}
export function logout() {
  localStorage.removeItem(AUTH_KEY);
}
export function isLoggedIn() {
  return !!getAuth();
}
export function getRole() {
  return getAuth()?.role || 'guest';
}

export function getNextOr(fallback) {
  const p = new URLSearchParams(location.search);
  return p.get('next') || fallback;
}

export function goHomeForRole(role = getRole()) {
  const url = HOME[role] || '/index.html';
  location.replace(url);
}

/**
 * Guard genérico para proteger páginas.
 * - allowedRoles: array de roles permitidos (p.ej. ['citizen'] o ['edet','admin'])
 * - loginUrl: adónde mandar si no está logueado o su rol no corresponde
 */
export function guard(allowedRoles, loginUrl) {
  const user = getAuth();
  const next = location.pathname + location.search;

  // No logueado → redirige al login correcto con ?next=
  if (!user) {
    location.replace(`${loginUrl}?next=${encodeURIComponent(next)}`);
    return false;
  }
  // Con rol pero no autorizado → lo mandamos a su home
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    goHomeForRole(user.role);
    return false;
  }
  return true;
}

/**
 * Cambia el UI (navbar y cualquier parte) según rol/estado.
 * Usa atributos:
 *  - data-if-role="citizen,edet,admin"
 *  - data-if-auth="guest" | "logged"
 *  - data-logout  (para el botón Salir)
 */
export function applyRoleUI(root = document) {
  const role = getRole();
  const logged = isLoggedIn();

  // Mostrar/Ocultar por rol
  root.querySelectorAll('[data-if-role]').forEach(el => {
    const roles = el.getAttribute('data-if-role')
      .split(',').map(s => s.trim());
    el.hidden = !roles.includes(role);
  });

  // Mostrar/Ocultar por estado de autenticación
  root.querySelectorAll('[data-if-auth]').forEach(el => {
    const need = el.getAttribute('data-if-auth'); // 'guest' | 'logged'
    el.hidden = (need === 'logged') ? !logged : logged; // guest visible si !logged
  });

  // Botón Salir
  root.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
      location.replace('/index.html');
    });
  });
}

/* ------------ Helpers opcionales de “BD” demo para EDET --------------- */
export function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}
export function saveUser(u) {
  const list = loadUsers();
  list.push(u);
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}
export function findUserByEmail(email) {
  return loadUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}