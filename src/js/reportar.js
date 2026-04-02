// src/js/reportar.js

const form = document.getElementById("form-reporte");

/**
 * Calcula prioridad según el tipo de problema
 */
function calcularPrioridadPorTipo(tipo) {
  switch (tipo) {
    case "poste-danado":
    case "cable-caido":
    case "medidor-quemado":
    case "transformador-riesgo":
      return "alta";

    case "corte-total":
    case "baja-tension":
    case "obra-cercana":
      return "media";

    case "luminaria-publica":
    case "otros":
    default:
      return "baja";
  }
}

// 🔒 Guard de sesión usando localStorage
document.addEventListener("DOMContentLoaded", () => {

  const session = JSON.parse(localStorage.getItem("cr_auth"));

  if (!session) {
    alert("Debes iniciar sesión para enviar reportes.");
    window.location.href = "./login.html";
    return;
  }

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const tipo = document.getElementById("tipo").value.trim();
    const ubicacion =
      document.getElementById("ubicacion")?.value.trim() ||
      document.getElementById("direccion")?.value.trim() ||
      "";
    const descripcion = document.getElementById("descripcion").value.trim();
    const zona = document.getElementById("zona")?.value.trim() || "";

    const inputImagenes = document.getElementById("imagenes");
    const archivos = inputImagenes ? Array.from(inputImagenes.files) : [];

    if (!tipo || !ubicacion || !descripcion) {
      alert("Completá los campos obligatorios.");
      return;
    }

    // 🔥 Convertimos imágenes a base64 para guardarlas en localStorage
    const leerImagenes = archivos.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(leerImagenes).then((imagenesBase64) => {

      const prioridad = calcularPrioridadPorTipo(tipo);

      const reportes = JSON.parse(localStorage.getItem("reportes")) || [];

      const nuevoReporte = {
        id: Date.now().toString(),
        usuarioId: session.uid,
        tipo,
        ubicacion,
        descripcion,
        zona,
        estado: "pendiente",
        prioridad,
        fecha: new Date().toISOString(),
        imagenes: imagenesBase64,
        codigoSeguimiento: "CR-" + Math.random().toString(36).substring(2, 8).toUpperCase()
      };

      reportes.push(nuevoReporte);

      localStorage.setItem("reportes", JSON.stringify(reportes));

      alert("✅ Reporte enviado con éxito.");
      window.location.href = "./mis-reportes.html";
    });

  });

});
