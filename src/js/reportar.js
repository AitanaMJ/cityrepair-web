import { auth, db, storage } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-storage.js";

const form = document.getElementById('form-reporte');
const inputFotos = document.getElementById('fotos'); // 👈 input de imágenes

onAuthStateChanged(auth, async (user) => {
  if (user) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const tipo = document.getElementById('tipo').value.trim();
      const ubicacion = document.getElementById('ubicacion') 
        ? document.getElementById('ubicacion').value.trim()
        : document.getElementById('direccion')?.value.trim() || "";
      const descripcion = document.getElementById('descripcion').value.trim();
      const zona = document.getElementById('zona')?.value.trim() || "";

      if (!tipo || !ubicacion || !descripcion) {
        alert("Por favor completa todos los campos obligatorios.");
        return;
      }

      try {
        // ===== Subir fotos a Firebase Storage =====
        const archivos = inputFotos?.files || [];
        const urlsFotos = [];

        for (const file of archivos) {
          const storageRef = ref(storage, `reportes/${user.uid}/${Date.now()}-${file.name}`);
          const snap = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snap.ref);
          urlsFotos.push(url);
        }

        // ===== Guardar reporte en Firestore =====
        await addDoc(collection(db, 'reportes'), {
          usuarioId: user.uid,
          tipo,
          ubicacion,
          descripcion,
          zona,
          estado: 'pendiente',
          fecha: serverTimestamp(),
          fotos: urlsFotos // 👈 se guarda el array de URLs
        });

        sessionStorage.setItem('flash', '✅ Reporte enviado con éxito');
        form.reset();
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
