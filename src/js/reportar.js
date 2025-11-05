import { auth, db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";

const form = document.getElementById('form-reporte');

onAuthStateChanged(auth, async (user) => {
  if (user) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const tipo = document.getElementById('tipo').value.trim();
      const ubicacion = document.getElementById('ubicacion') 
        ? document.getElementById('ubicacion').value.trim()
        : document.getElementById('direccion')?.value.trim() || ""; // por si el input se llama "direccion"
      const descripcion = document.getElementById('descripcion').value.trim();

      if (!tipo || !ubicacion || !descripcion) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
      }

      try {
        await addDoc(collection(db, 'reportes'), {
          usuarioId: user.uid,
          tipo: tipo,
          ubicacion: ubicacion,
          descripcion: descripcion,
          estado: 'pendiente',
          fecha: serverTimestamp()
        });

        // flash opcional para mostrar en mis-reportes
        sessionStorage.setItem('flash', '✅ Reporte enviado con éxito');

        form.reset();
        // redirige a Mis Reportes
        window.location.href = "./mis-reportes.html";
      } catch (error) {
        console.error('Error al enviar reporte:', error);
        alert('❌ Error al enviar reporte.');
      }
    });
  } else {
    alert('Debes iniciar sesión para enviar reportes.');
    window.location.href = "./login.html";
  }
});
