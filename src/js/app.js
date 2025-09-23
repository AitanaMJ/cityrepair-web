// src/js/app.js
console.log("CityRepair listo ✅");

(function () {
  // =====================================================================
  //                    Helpers de autenticación (simple)
  // =====================================================================
  const AUTH_KEY = "cr_auth";

  function getAuth() {
    try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; }
    catch { return null; }
  }
  function isLoggedIn() {
    return !!getAuth();
  }
  function hasRole(role) {
    const u = getAuth();
    return !!u && u.role === role;
  }
  function redirectToLogin(nextPath) {
    const url = `/pages/login.html?next=${encodeURIComponent(nextPath)}`;
    window.location.replace(url);
  }

  // Guard genérico para páginas que requieren ciudadano
  function guardCitizenPage() {
    const p = location.pathname;
    const needsCitizen =
      p.endsWith("/pages/reportar.html") || p.endsWith("/pages/mis-reportes.html");
    if (needsCitizen && !hasRole("citizen")) {
      // Conservamos query/hash si los hubiera
      const next = location.pathname + location.search + location.hash;
      redirectToLogin(next);
    }
  }
  guardCitizenPage();

  // Gate para links de tarjetas en el INICIO (por si no pusiste data-auth)
  document.addEventListener("DOMContentLoaded", () => {
    const protectHrefs = ["/pages/reportar.html", "/pages/mis-reportes.html"];

    document.querySelectorAll('main a[href^="/pages/"]').forEach((a) => {
      const href = a.getAttribute("href");
      if (!protectHrefs.includes(href)) return;

      a.addEventListener("click", (e) => {
        // Exigimos rol citizen para Reportar y Mis Reportes
        if (!hasRole("citizen")) {
          e.preventDefault();
          redirectToLogin(href);
        }
      });
    });
  });

  // =====================================================================
  //                         MAPA / FORMULARIO REPORTE
  // =====================================================================
  const form = document.getElementById("form-reporte");
  const btnGeo = document.getElementById("btn-geo");
  const coordsBox = document.getElementById("coords");
  const mapEl = document.getElementById("map");
  const direccionInput =
    document.getElementById("direccion") ||
    document.querySelector('input[name="direccion"]');
  const btnBuscarDir = document.getElementById("btn-buscar-dir");

  let map, marker, lastFetchAbort;
  let typing = false;

  const isInputFocused = () => document.activeElement === direccionInput;
  const showCoords = (lat, lng) => {
    if (coordsBox) coordsBox.textContent = `Lat: ${lat.toFixed(5)} — Lng: ${lng.toFixed(5)}`;
  };
  const debounce = (fn, wait = 600) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

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

      if (!direccionInput) return;
      if (!normalizeIfPossible) return;
      if (typing || isInputFocused()) return;

      if (data.display_name) direccionInput.value = data.display_name;
    } catch (err) {
      if (err.name !== "AbortError") console.warn("[ReverseGeocode] Error:", err);
    }
  }

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

      if (normalize && direccionInput && display_name) {
        direccionInput.value = display_name;
      }
    } catch (err) {
      if (err.name !== "AbortError") console.warn("[ForwardGeocode] Error:", err);
    }
  }

  const forwardGeocodeDebounced = debounce((q) => forwardGeocode(q, { normalize: false }), 700);

  function initMap(lat = -26.8285, lng = -65.2226, zoom = 12) {
    if (!mapEl || typeof L === "undefined") return;
    if (map) return;

    map = L.map("map").setView([lat, lng], zoom);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contrib.",
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
    if (direccionInput && !direccionInput.value) {
      reverseGeocode(lat, lng, { normalizeIfPossible: true });
    }
  }

  if (btnGeo) {
    btnGeo.addEventListener("click", () => {
      if (!("geolocation" in navigator)) { alert("Tu navegador no soporta geolocalización."); return; }
      btnGeo.disabled = true;
      btnGeo.textContent = "Obteniendo ubicación...";
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (!map) initMap(latitude, longitude, 16);
          map.setView([latitude, longitude], 16);
          marker.setLatLng([latitude, longitude]);
          showCoords(latitude, longitude);
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

  if (btnBuscarDir && direccionInput) {
    btnBuscarDir.addEventListener("click", () => {
      forwardGeocode(direccionInput.value, { normalize: true });
    });
  }

  if (direccionInput) {
    direccionInput.addEventListener("focus", () => { typing = true; });
    direccionInput.addEventListener("blur", () => { typing = false; });

    direccionInput.addEventListener("input", (e) => {
      typing = true;
      forwardGeocodeDebounced(e.target.value);
    });

    direccionInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        typing = false;
        forwardGeocode(direccionInput.value, { normalize: true });
      }
    });
  }

  if (mapEl) initMap();

  // =====================================================================
  //                     Envío del formulario de Reporte
  // =====================================================================
  document.addEventListener("DOMContentLoaded", () => {
    const formDom = document.getElementById("form-reporte");
    if (!formDom) return;

    formDom.addEventListener("submit", (e) => {
      e.preventDefault();

      // Si por algún motivo llegaste sin login, te pido login ahora
      if (!hasRole("citizen")) {
        redirectToLogin("/pages/reportar.html");
        return;
      }

      const tipoProblemaEl = document.querySelector("#tipo-problema");
      const direccionEl    = document.querySelector("#direccion");
      const descripcionEl  = document.querySelector("#descripcion");

      const tipoProblema = tipoProblemaEl ? tipoProblemaEl.value.trim() : "";
      const direccion    = direccionEl ? direccionEl.value.trim() : "";
      const descripcion  = descripcionEl ? descripcionEl.value.trim() : "";

      if (!tipoProblema) { mostrarAlerta("Por favor selecciona un tipo de problema", "danger"); return; }
      if (!direccion)    { mostrarAlerta("Por favor ingresa una dirección o usa tu ubicación", "danger"); return; }
      if (!descripcion)  { mostrarAlerta("Por favor describe el problema", "danger"); return; }

      mostrarAlerta("✅ Reporte enviado con éxito", "success");
      formDom.reset();

      // Ir a Mis Reportes (ruta absoluta)
      window.location.href = "/pages/mis-reportes.html";
    });

    function mostrarAlerta(mensaje, tipo = "info") {
      const alerta = document.createElement("div");
      alerta.className = `alert alert-${tipo} mt-3`;
      alerta.textContent = mensaje;

      const container = document.querySelector("main") || document.body;
      container.prepend(alerta);

      setTimeout(() => alerta.remove(), 4000);
    }
  });

  // =====================================================================
  //                            DRAWER LATERAL
  // =====================================================================
  const drawer   = document.querySelector(".drawer");
  const overlay  = document.querySelector(".drawer-overlay");
  const btnHamb  = document.querySelector(".hamburger");
  const btnClose = document.querySelector(".drawer-close");

  if (drawer && overlay && btnHamb && btnClose) {
    const openDrawer = () => {
      drawer.classList.add("show");
      overlay.hidden = false;
      overlay.offsetHeight; // reflow
      overlay.classList.add("show");
      drawer.setAttribute("aria-hidden","false");
      btnHamb.setAttribute("aria-expanded","true");
      const first = drawer.querySelector("a,button");
      first && first.focus();
    };

    const closeDrawer = () => {
      drawer.classList.remove("show");
      overlay.classList.remove("show");
      drawer.setAttribute("aria-hidden","true");
      btnHamb.setAttribute("aria-expanded","false");
      setTimeout(() => { overlay.hidden = true; }, 200);
      btnHamb.focus();
    };

    btnHamb.addEventListener("click", openDrawer);
    btnClose.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", closeDrawer);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeDrawer(); });

    drawer.addEventListener("click", (e) => {
      if (e.target.closest("a")) closeDrawer();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768 && drawer.classList.contains("show")) closeDrawer();
    });
  }
})();
