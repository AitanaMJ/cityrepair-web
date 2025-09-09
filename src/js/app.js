console.log("CityRepair listo ✅");

(function () {
  const form = document.getElementById("form-reporte");
  const btnGeo = document.getElementById("btn-geo");
  const coordsBox = document.getElementById("coords");
  const mapEl = document.getElementById("map");
  const direccionInput = document.getElementById("direccion") || document.querySelector('input[name="direccion"]');
  const btnBuscarDir = document.getElementById("btn-buscar-dir");

  let map, marker, lastFetchAbort;
  let typing = false; // <-- flag: el usuario está escribiendo

  // Utils
  const isInputFocused = () => document.activeElement === direccionInput;
  const showCoords = (lat, lng) => {
    if (coordsBox) coordsBox.textContent = `Lat: ${lat.toFixed(5)} — Lng: ${lng.toFixed(5)}`;
  };
  const debounce = (fn, wait = 600) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  // ---- Reverse geocoding (lat,lng -> dirección) ----
  async function reverseGeocode(lat, lng, { normalizeIfPossible = true } = {}) {
    try {
      if (lastFetchAbort) lastFetchAbort.abort();
      lastFetchAbort = new AbortController();

      const url = new URL("https://nominatim.openstreetmap.org/reverse");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("lat", lat);
      url.searchParams.set("lon", lng);
      url.searchParams.set("accept-language", "es");
      url.searchParams.set("addressdetails", "1");

      const res = await fetch(url.toString(), { signal: lastFetchAbort.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // NO sobrescribir si la persona está escribiendo o el input está enfocado
      if (!direccionInput) return;
      if (!normalizeIfPossible) return;
      if (typing || isInputFocused()) return;

      if (data.display_name) direccionInput.value = data.display_name;
    } catch (err) {
      if (err.name !== "AbortError") console.warn("[ReverseGeocode] Error:", err);
    }
  }

  // ---- Forward geocoding (dirección -> lat,lng) ----
  async function forwardGeocode(query, { normalize = false } = {}) {
    if (!query || query.trim().length < 4) return;
    try {
      if (lastFetchAbort) lastFetchAbort.abort();
      lastFetchAbort = new AbortController();

      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("format", "jsonv2");
      url.searchParams.set("q", query);
      url.searchParams.set("addressdetails", "1");
      url.searchParams.set("accept-language", "es");
      url.searchParams.set("limit", "1");
      // url.searchParams.set("countrycodes", "ar"); // opcional

      const res = await fetch(url.toString(), { signal: lastFetchAbort.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const results = await res.json();
      if (!Array.isArray(results) || results.length === 0) return;

      const { lat, lon, display_name } = results[0];
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lon);

      if (!map) initMap(latitude, longitude, 16);
      map.setView([latitude, longitude], 16);
      marker.setLatLng([latitude, longitude]);
      showCoords(latitude, longitude);

      // Solo normalizar el input si fue una búsqueda explícita (botón/Enter)
      if (normalize && direccionInput && display_name) {
        direccionInput.value = display_name;
      }
    } catch (err) {
      if (err.name !== "AbortError") console.warn("[ForwardGeocode] Error:", err);
    }
  }

  const forwardGeocodeDebounced = debounce((q) => forwardGeocode(q, { normalize: false }), 700);

  // ---- Mapa ----
  function initMap(lat = -26.8285, lng = -65.2226, zoom = 12) {
    if (!mapEl || typeof L === "undefined") return;
    if (map) return;

    map = L.map("map").setView([lat, lng], zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contrib.',
    }).addTo(map);

    marker = L.marker([lat, lng], { draggable: true }).addTo(map);

    marker.on("moveend", (e) => {
      const { lat, lng } = e.target.getLatLng();
      showCoords(lat, lng);
      reverseGeocode(lat, lng, { normalizeIfPossible: true });
    });

    map.on("click", (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      showCoords(lat, lng);
      reverseGeocode(lat, lng, { normalizeIfPossible: true });
    });

    showCoords(lat, lng);
    // Solo autollenar si el input está vacío
    if (direccionInput && !direccionInput.value) {
      reverseGeocode(lat, lng, { normalizeIfPossible: true });
    }
  }

  // ---- Eventos UI ----
  if (btnGeo) {
    btnGeo.addEventListener("click", () => {
      if (!("geolocation" in navigator)) {
        alert("Tu navegador no soporta geolocalización."); return;
      }
      btnGeo.disabled = true;
      btnGeo.textContent = "Obteniendo ubicación...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (!map) initMap(latitude, longitude, 16);
          map.setView([latitude, longitude], 16);
          marker.setLatLng([latitude, longitude]);
          showCoords(latitude, longitude);
          // acá sí normalizamos porque es acción explícita del usuario (geo)
          reverseGeocode(latitude, longitude, { normalizeIfPossible: true });
          btnGeo.textContent = "📍 Usar mi ubicación actual";
          btnGeo.disabled = false;
        },
        () => {
          alert("No se pudo obtener la ubicación.");
          btnGeo.textContent = "📍 Usar mi ubicación actual";
          btnGeo.disabled = false;
        }
      );
    });
  }

  // Botón Buscar: búsqueda explícita -> normaliza input
  if (btnBuscarDir && direccionInput) {
    btnBuscarDir.addEventListener("click", () => {
      forwardGeocode(direccionInput.value, { normalize: true });
    });
  }

  // Tipeo: dispara búsqueda (NO normaliza, no pisa texto)
  if (direccionInput) {
    direccionInput.addEventListener("focus", () => { typing = true; });
    direccionInput.addEventListener("blur", () => { typing = false; });

    direccionInput.addEventListener("input", (e) => {
      typing = true;
      forwardGeocodeDebounced(e.target.value); // centra mapa, NO pisa texto
    });

    direccionInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        typing = false;
        forwardGeocode(direccionInput.value, { normalize: true }); // Enter sí normaliza
      }
    });
  }

  if (mapEl) initMap();

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      // const { lat, lng } = marker.getLatLng();
      alert("✅ Reporte enviado (demo). Luego conectamos con la API.");
      form.reset();
      window.location.href = "./mis-reportes.html";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-reporte");

  form.addEventListener("submit", (e) => {
    e.preventDefault(); // evita que recargue la página

    const tipoProblema = document.querySelector("#tipo-problema").value.trim();
    const direccion = document.querySelector("#direccion").value.trim();
    const descripcion = document.querySelector("#descripcion").value.trim();

    // Validaciones simples
    if (!tipoProblema) {
      mostrarAlerta("Por favor selecciona un tipo de problema", "danger");
      return;
    }

    if (!direccion) {
      mostrarAlerta("Por favor ingresa una dirección o usa tu ubicación", "danger");
      return;
    }

    if (!descripcion) {
      mostrarAlerta("Por favor describe el problema", "danger");
      return;
    }

    // Si todo está bien
    mostrarAlerta("✅ Reporte enviado con éxito", "success");
    form.reset(); // limpia el formulario
  });

  function mostrarAlerta(mensaje, tipo = "info") {
    const alerta = document.createElement("div");
    alerta.className = `alert alert-${tipo} mt-3`;
    alerta.textContent = mensaje;

    const container = document.querySelector("main");
    container.prepend(alerta);

    setTimeout(() => alerta.remove(), 4000); // se borra después de 4 segundos
  }
});

})();
