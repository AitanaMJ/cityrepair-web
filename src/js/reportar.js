// src/js/reportar.js


// Formulario principal
const form = document.getElementById("form-reporte");

/**
 * Calcula prioridad según el tipo de problema
 * (usa los value del <select id="tipo">)
 */
function calcularPrioridadPorTipo(tipo) {
  switch (tipo) {
    // ⚠️ MÁS PELIGROSOS
    case "poste-danado":
    case "cable-caido":
    case "medidor-quemado":
    case "transformador-riesgo":
      return "alta";

    // ⚡ CORTES Y RIESGO MODERADO
    case "corte-total":
    case "baja-tension":
    case "obra-cercana":
      return "media";

    // 💡 COSAS MENOS URGENTES
    case "luminaria-publica":
    case "otros":
    default:
      return "baja";
  }
}

// 🔒 Guardia de autenticación para TODA la página
onAuthStateChanged(auth, (user) => {
  if (!user) {
    // no hay sesión → no puede usar esta página
    if (typeof window.mostrarAlerta === "function") {
      window.mostrarAlerta(
        "Debes iniciar sesión para enviar reportes.",
        "warn",
        { titulo: "Sesión requerida" }
      );
    } else {
      alert("Debes iniciar sesión para enviar reportes.");
    }

    setTimeout(() => {
      window.location.href = "./login.html";
    }, 600);

    return; // 👈 cortamos acá, no registramos el submit
  }

  // ✅ hay usuario, recién acá activamos el formulario
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tipo = document.getElementById("tipo").value.trim();
    const ubicacion =
      document.getElementById("ubicacion")?.value.trim() ||
      document.getElementById("direccion")?.value.trim() ||
      "";
    const descripcion = document.getElementById("descripcion").value.trim();
    const zona = document.getElementById("zona")?.value.trim() || "";

    // input de imágenes (puede no existir o no tener archivos)
    const inputImagenes = document.getElementById("imagenes");
    const archivos = inputImagenes ? Array.from(inputImagenes.files) : [];

    // Validaciones básicas
    if (!tipo || !ubicacion || !descripcion) {
      if (typeof window.mostrarAlerta === "function") {
        window.mostrarAlerta("Completá los campos obligatorios.", "warn", {
          titulo: "Falta info",
        });
      } else {
        alert("Por favor completa todos los campos obligatorios.");
      }
      return;
    }

    try {
      // 🔥 calcular prioridad según tipo
      const prioridad = calcularPrioridadPorTipo(tipo);

      // 1️⃣ Crear el reporte en Firestore SIN imágenes aún
      const docRef = await addDoc(collection(db, "reportes"), {
        usuarioId: user.uid,
        tipo,
        ubicacion,
        descripcion,
        zona,
        estado: "pendiente",
        prioridad, // 👈 se guarda en la BD
        fecha: serverTimestamp(),
        imagenes: [], // se llenará luego si hay archivos
        codigoSeguimiento: "", // se completa después
      });

      const idReporte = docRef.id;

      // Generar código de seguimiento tipo "CR-ABC123"
      const codigoSeguimiento = "CR-" + idReporte.substring(0, 6).toUpperCase();

      // 2️⃣ Si hay archivos, subirlos a Storage y obtener URLs
      let urlsImagenes = [];

      if (archivos.length > 0) {
        const promesas = archivos.map(async (archivo, index) => {
          // ruta: reportes/{idReporte}/[indice]-nombre
          const storageRef = ref(
            storage,
            `reportes/${idReporte}/${index}-${archivo.name}`
          );

          // subir el archivo
          await uploadBytes(storageRef, archivo);

          // obtener URL pública
          const url = await getDownloadURL(storageRef);
          return url;
        });

        urlsImagenes = await Promise.all(promesas);
      }

      // 3️⃣ Actualizar el documento con imágenes (si hay) y código de seguimiento
      const updateData = { codigoSeguimiento };

      if (urlsImagenes.length > 0) {
        updateData.imagenes = urlsImagenes;
      }

      await updateDoc(doc(db, "reportes", idReporte), updateData);

      // ✅ toast lindo
      if (typeof window.mostrarAlerta === "function") {
        window.mostrarAlerta("Reporte enviado con éxito.", "success", {
          titulo: "Listo",
        });
        // después de mostrarlo, ir a Mis reportes
        setTimeout(() => {
          window.location.href = "./mis-reportes.html";
        }, 900);
      } else {
        alert("✅ Reporte enviado con éxito");
        window.location.href = "./mis-reportes.html";
      }
    } catch (error) {
      console.error("Error al enviar reporte:", error);
      if (typeof window.mostrarAlerta === "function") {
        window.mostrarAlerta("No se pudo enviar el reporte.", "danger", {
          titulo: "Error",
        });
      } else {
        alert("❌ Error al enviar reporte.");
      }
    }
  });
});
