// src/js/login.js
document.addEventListener('DOMContentLoaded', () => {
  const AUTH_KEY = 'cr_auth';

  const setAuth = (user) =>
    localStorage.setItem(AUTH_KEY, JSON.stringify({ ...user, ts: Date.now() }));

  const getNext = () => {
    const params = new URLSearchParams(location.search);
    return params.get('next'); // puede ser null
  };

  const go = (fallback) => {
    const n = getNext();
    // si viene de requireAuth irá con ?next=...
    location.href = n ? n : fallback;
  };

  // --- Login normal (form) ---
  const form = document.getElementById('form-login') || document.getElementById('loginForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]')?.value.trim();
      const pass  = form.querySelector('input[type="password"]')?.value.trim();
      if (!email || !pass) { alert('Completá email y contraseña'); return; }

      // Ajusta el rol que quieras para login normal
      setAuth({ email, role: 'citizen' });
      // fallback si no hay ?next=
      go('../index.html');
    });
  }



  // --- Demo como Administrador ---
  document.getElementById('demoAdmin')?.addEventListener('click', (e) => {
    e.preventDefault();
    setAuth({ email: 'admin@cityrepair.com', role: 'admin' });
    go('./admin.html'); // fallback
  });
});