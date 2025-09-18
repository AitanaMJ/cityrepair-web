// src/js/auth.js
const AUTH_KEY = 'cr_auth';          // sesión activa
const USERS_KEY = 'cr_edet_users';   // "BD" demo para registro EDET

export function setAuth(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify({ ...user, ts: Date.now() }));
}
export function getAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; }
  catch { return null; }
}
export function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
}
export function isLoggedIn() {
  return !!getAuth();
}
export function hasRole(role) {
  const u = getAuth(); return u && u.role === role;
}
export function requireRole(role, redirect = './edet-login.html') {
  if (!hasRole(role)) window.location.replace(redirect);
}
export function logoutTo(url = '../index.html') {
  clearAuth(); window.location.replace(url);
}

/* ------- Helpers de “BD” DEMO ------- */
export function loadUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
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
