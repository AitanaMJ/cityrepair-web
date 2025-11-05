// src/js/edet-register.js
import { auth, db } from './firebase.js';
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// mismas validaciones que usabas en edet.js
const emailOK = (email) => /@edet\.com\.ar$/i.test(email);
const eidOK   = (eid)   => /^EDET-\d{5,6}$/i.test(eid);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('edetRegisterForm');   // ojo con el id en el html
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre   = document.getElementById('rNombre').value.trim();
    const apellido = document.getElementById('rApellido').value.trim();
    const eid      = document.getElementById('rEid').value.trim();
    const depto    = document.getElementById('rDepto').value.trim();
    const tel      = document.getElementById('rTel').value.trim();
    const email    = document.getElementById('rEmail').value.trim();
    const pass     = document.getElementById('rPass').value.trim();

    // validaciones
    if (!nombre || !apellido || !depto) {
      window.mostrarAlerta?.('Completá todos los campos obligatorios', 'danger', {titulo:'Error'});
      return;
    }
    if (!emailOK(email)) {
      window.mostrarAlerta?.('Usá tu correo corporativo @edet.com.ar', 'danger', {titulo:'Email inválido'});
      return;
    }
    if (!eidOK(eid)) {
      window.mostrarAlerta?.('ID de empleado inválido. Formato: EDET-001234', 'danger', {titulo:'ID inválido'});
      return;
    }
    if (pass.length < 6) {
      window.mostrarAlerta?.('La contraseña debe tener al menos 6 caracteres', 'danger', {titulo:'Contraseña muy corta'});
      return;
    }

    try {
      // 1. crear usuario en Auth
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = cred.user.uid;

      // 2. guardar sus datos en Firestore
      await setDoc(doc(db, 'usuarios', uid), {
        rol: 'edet',            // 👈 esto es lo importante
        nombre,
        apellido,
        eid,
        depto,
        tel,
        email,
        creadoEn: new Date()
      });

      // 3. avisar y redirigir
      window.mostrarAlerta?.('Registro EDET completo', 'success', {titulo:'Listo'});
      setTimeout(() => {
        window.location.href = './edet-dashboard.html';
      }, 900);

    } catch (err) {
      console.error('Error al registrar EDET:', err);
      window.mostrarAlerta?.('No se pudo registrar el administrador', 'danger', {titulo:'Error'});
    }
  });
});
