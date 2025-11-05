// src/js/edet-login.js
import { auth, db } from './firebase.js';
import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

const emailOK = (email) => /@edet\.com\.ar$/i.test(email);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('edet-login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const pass  = document.getElementById('password').value.trim();

    if (!emailOK(email)) {
      window.mostrarAlerta?.('Usá tu correo @edet.com.ar', 'danger', {titulo:'Email inválido'});
      return;
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      const uid = cred.user.uid;

      // buscar el rol en Firestore
      const snap = await getDoc(doc(db, 'usuarios', uid));
      const data = snap.data() || {};

      if (data.rol === 'edet') {
        window.mostrarAlerta?.('Bienvenido', 'success', {titulo:'EDET'});
        setTimeout(() => {
          window.location.href = './edet-dashboard.html';
        }, 700);
      } else {
        // existe en auth pero no tiene rol edet
        window.mostrarAlerta?.('Tu cuenta no tiene permiso EDET', 'danger', {titulo:'Acceso denegado'});
      }

    } catch (err) {
      console.error(err);
      window.mostrarAlerta?.('Credenciales inválidas', 'danger', {titulo:'Error'});
    }
  });
});

