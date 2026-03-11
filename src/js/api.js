const API_URL = "http://localhost:3000/api";

export async function obtenerReportes() {
  const res = await fetch(`${API_URL}/reportes`);
  return await res.json();
}

export async function crearReporte(data) {
  const res = await fetch(`${API_URL}/reportes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return await res.json();
}