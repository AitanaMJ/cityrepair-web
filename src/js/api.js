const API = "http://localhost:3000/api";

export async function obtenerReportes() {
  const res = await fetch(`${API}/reportes`);
  return await res.json();
}

export async function crearReporte(data) {
  const res = await fetch(`${API}/reportes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return await res.json();
}

export async function actualizarReporte(id, data) {
  const res = await fetch(`${API}/reportes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return await res.json();
}

export async function eliminarReporte(id) {
  const res = await fetch(`${API}/reportes/${id}`, {
    method: "DELETE"
  });

  return await res.json();
}