// src/js/register.js
import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { setDoc, doc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { setAuth } from "./auth.js";

const form = document.querySelector("form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.querySelector("input[type='email']")?.value?.trim();
    const password = form.querySelector("input[type='password']")?.value?.trim();

    if (!email || !password) { alert('Completá email y contraseña'); return; }
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;
      // guardamos registro en Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        email: user.email,
        role: 'citizen',
        fechaRegistro: serverTimestamp()
      });
      // sincronizamos con localStorage (tu API)
      setAuth({ email: user.email, role: 'citizen' });
      alert('✅ Usuario registrado correctamente');
      // intentar redirigir a login.html en pages (mantener rutas relativas)
      location.href = 'login.html';
    } catch (err) {
      alert('Error al registrar: ' + err.message);
    }
  });
}
