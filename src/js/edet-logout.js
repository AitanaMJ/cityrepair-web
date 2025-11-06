// src/js/edet-logout.js
import { auth } from './firebase.js';
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('edet-logout');
  if (!btn) return;

  btn.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      // 1) cerrar sesión en Firebase
      await signOut(auth);

      // 2) borrar la sesión local que usa toda la app
      localStorage.removeItem('cr_auth');

      // 3) opcional: mostrar toast
      window.mostrarAlerta?.('Sesión EDET cerrada', 'success', { titulo: 'Hasta pronto' });

      // 4) redirigir al login EDET
      setTimeout(() => {
        window.location.href = '/pages/edet-login.html';
      }, 500);

    } catch (err) {
      console.error('Error cerrando sesión EDET:', err);
      window.mostrarAlerta?.('No se pudo cerrar la sesión', 'danger', { titulo: 'Error' });
    }
  });
});