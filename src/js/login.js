// src/js/login.js
document.addEventListener('DOMContentLoaded', () => {
  const AUTH_KEY = 'cr_auth';
  const params = new URLSearchParams(location.search);
  const next = params.get('next') || '/index.html';

  const saveSession = (payload) =>
    localStorage.setItem(AUTH_KEY, JSON.stringify({ ...payload, ts: Date.now() }));

  const goNext = () => location.replace(next);

  // 1) Login normal por formulario
  const form = document.getElementById('loginForm'); // asegurate de tener <form id="loginForm">
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]')?.value.trim();
      const pass  = form.querySelector('input[type="password"]')?.value.trim();
      if (!email || !pass) { alert('Completá email y contraseña'); return; }
      saveSession({ email, role: 'user' });
      goNext();
    });
  }

  // 2) Botones “demo”
  document.getElementById('demoCitizen')?.addEventListener('click', (e) => {
    e.preventDefault();
    saveSession({ email: 'demo@cityrepair.com', role: 'citizen' });
    goNext();
  });

  document.getElementById('demoAdmin')?.addEventListener('click', (e) => {
    e.preventDefault();
    saveSession({ email: 'admin@cityrepair.com', role: 'admin' });
    goNext();
  });
});
