// src/js/logout.js
import { auth } from './firebase.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.querySelector('#btn-logout, [data-logout]');
  if (!btn) {
    console.warn('Botón de logout no encontrado en esta página.');
    return;
  }

  // Mostrar u ocultar el botón según el estado del usuario
  onAuthStateChanged(auth, (user) => {
    btn.hidden = !user;
  });

  // Acción al hacer clic en "Cerrar sesión"
  btn.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await signOut(auth);
      window.mostrarAlerta?.('Sesión cerrada correctamente', 'success', { titulo: 'Hasta pronto' });

      // Redirige a la pantalla de inicio de sesión
      setTimeout(() => {
        window.location.href = '/pages/login.html';
      }, 800);
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      window.mostrarAlerta?.('No se pudo cerrar la sesión', 'danger', { titulo: 'Error' });
    }
  });
});
