// src/js/edet-logout.js

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('edet-logout');
  if (!btn) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();

    try {
      // 1) borrar sesión local
      localStorage.removeItem('session');

      // 2) opcional: limpiar otras claves si usabas alguna vieja
      localStorage.removeItem('cr_auth');

      // 3) mostrar mensaje
      window.mostrarAlerta?.(
        'Sesión EDET cerrada correctamente',
        'success',
        { titulo: 'Hasta pronto' }
      );

      // 4) redirigir
      setTimeout(() => {
        window.location.href = '/pages/edet-login.html';
      }, 500);

    } catch (err) {
      console.error('Error cerrando sesión:', err);
      window.mostrarAlerta?.(
        'No se pudo cerrar la sesión',
        'danger',
        { titulo: 'Error' }
      );
    }
  });
});