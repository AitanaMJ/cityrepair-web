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

// 🔒 Verificar sesión
document.addEventListener("DOMContentLoaded", () => {

  const session = JSON.parse(localStorage.getItem("cr_auth"));

  if (!session) {
    alert("Debes iniciar sesión para enviar reportes.");
    window.location.href = "./login.html";
    return;
  }

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const tipo = document.getElementById("tipo").value.trim();

    const ubicacion =
      document.getElementById("ubicacion")?.value.trim() ||
      document.getElementById("direccion")?.value.trim() ||
      "";

    const descripcion =
      document.getElementById("descripcion").value.trim();

    const zona =
      document.getElementById("zona")?.value.trim() || "";

    if (!tipo || !ubicacion || !descripcion) {
      alert("Completá los campos obligatorios.");
      return;
    }

    const prioridad = calcularPrioridadPorTipo(tipo);

    try {

      const res = await fetch("http://localhost:3000/api/reportes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          usuario_id: session.id,
          tipo,
          ubicacion,
          descripcion,
          zona,
          prioridad
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear reporte");
      }

      alert("✅ Reporte enviado con éxito.");

      window.location.href = "./mis-reportes.html";

    } catch (error) {

      console.error(error);

      alert("❌ Error al enviar el reporte.");
    }

  });

});