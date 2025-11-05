// src/js/firebase-auth-sync.js
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { setAuth } from "./auth.js"; // usa la función existente en tu proyecto

// Sincroniza el estado de Firebase con el localStorage usado por tu app
onAuthStateChanged(auth, (user) => {
  if (user) {
    // establece auth local con role 'citizen' por defecto
    setAuth({ email: user.email, role: 'citizen' });
  } else {
    // limpia si se desconecta
    try { localStorage.removeItem('cr_auth'); } catch(e){}
  }
});
