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

  // 🔴 NUEVO: mostrar/ocultar botón de cerrar sesión del navbar
  document.addEventListener("DOMContentLoaded", () => {
    const btnLogout = document.getElementById("btnLogout");
    if (!btnLogout) return;

    const user = getAuth();
    if (user) {
      // mostrar
      btnLogout.style.display = "inline-flex";
      btnLogout.addEventListener("click", (e) => {
        e.preventDefault();
        // si también usás firebase signOut, lo hacés en el login.js o logout.js
        localStorage.removeItem("cr_auth");
        window.location.href = "/pages/login.html";
      });
    } else {
      // ocultar
      btnLogout.style.display = "none";
    }
  });

  // Guard genérico para páginas que requieren ciudadano
  function guardCitizenPage() {
    const p = location.pathname;
    const needsCitizen =
      p.endsWith("/pages/reportar.html") || p.endsWith("/pages/mis-reportes.html");
    if (needsCitizen && !hasRole("citizen")) {
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
        if (!hasRole("citizen")) {
          e.preventDefault();
          redirectToLogin(href);
        }
      });
    });
  });

  // =====================================================================
  //                           TOASTS CITYREPAIR
  // =====================================================================
  (function setupToastRoot(){
    if (!document.getElementById('toast-root')) {
      const r = document.createElement('div');
      r.id = 'toast-root';
      document.body.appendChild(r);
    }
  })();

  function mostrarAlerta(mensaje, tipo = "info", {titulo} = {}) {
    const root = document.getElementById('toast-root');
    if (!root) return;

    const map = {
      success: { cls: "toast-success", icon: "✅", title: titulo || "Listo" },
      info:    { cls: "toast-info",    icon: "ℹ️", title: titulo || "Info" },
      warn:    { cls: "toast-warn",    icon: "⚠️", title: titulo || "Atención" },
      danger:  { cls: "toast-error",   icon: "⛔", title: titulo || "Error" },
      error:   { cls: "toast-error",   icon: "⛔", title: titulo || "Error" },
    };
    const v = map[tipo] || map.info;

    const wrap = document.createElement('div');
    wrap.className = `toast-cr ${v.cls}`;
    wrap.setAttribute('role','status');
    wrap.setAttribute('aria-live','polite');

    wrap.innerHTML = `
      <div class="ico">${v.icon}</div>
      <div class="body">
        <p class="title">${v.title}</p>
        <p class="msg">${mensaje}</p>
      </div>
      <button class="close" aria-label="Cerrar">×</button>
      <div class="bar"><i></i></div>
    `;

    const LIFETIME = 4000;
    const bar = wrap.querySelector('.bar > i');
    bar.style.animationDuration = LIFETIME + 'ms';

    let timeoutId = setTimeout(() => close(), LIFETIME);
    const pause  = () => { bar.style.animationPlayState = 'paused'; clearTimeout(timeoutId); };
    const resume = () => { bar.style.animationPlayState = 'running'; timeoutId = setTimeout(() => close(), LIFETIME); };

    wrap.addEventListener('mouseenter', pause);
    wrap.addEventListener('mouseleave', resume);

    const close = () => {
      wrap.style.transition = 'transform .2s ease, opacity .2s ease';
      wrap.style.transform = 'translateY(-6px)';
      wrap.style.opacity = '0';
      setTimeout(() => wrap.remove(), 180);
    };
    wrap.querySelector('.close').addEventListener('click', close);

    while (root.children.length >= 4) root.firstChild.remove();
    root.prepend(wrap);
  }
  window.mostrarAlerta = mostrarAlerta;

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

    if (formDom.dataset.firebase === "1") return;

    formDom.addEventListener("submit", (e) => {
      e.preventDefault();

      if (!hasRole("citizen")) {
        redirectToLogin("/pages/reportar.html");
        return;
      }

      const tipoProblemaEl = document.querySelector("#tipo");
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

      window.location.href = "/pages/mis-reportes.html";
    });
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
      overlay.offsetHeight;
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


  
// ===== Mostrar / ocultar botones de sesión =====
document.addEventListener("DOMContentLoaded", () => {
  const user = (function(){
    try { return JSON.parse(localStorage.getItem('cr_auth')) || null; }
    catch { return null; }
  })();

  const btnLogin     = document.getElementById('btnLogin');
  const btnLogout    = document.getElementById('btnLogout');
  const drawerLogin  = document.getElementById('drawerLogin');
  const drawerLogout = document.getElementById('drawerLogout');

  const showLoggedUI = !!user;

  if (btnLogin)  btnLogin.hidden  = showLoggedUI;
  if (btnLogout) btnLogout.hidden = !showLoggedUI;

  if (drawerLogin)  drawerLogin.hidden  = showLoggedUI;
  if (drawerLogout) drawerLogout.hidden = !showLoggedUI;

  const doLogout = () => {
    localStorage.removeItem('cr_auth');
    window.location.href = '/index.html';
  };

  if (btnLogout)    btnLogout.addEventListener('click', (e) => { e.preventDefault(); doLogout(); });
  if (drawerLogout) drawerLogout.addEventListener('click', (e) => { e.preventDefault(); doLogout(); });
});

// --- manejar cierre de sesión (Firebase + localStorage) ---
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtns = document.querySelectorAll('[data-logout]');
  if (!logoutBtns.length) return;

  logoutBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      try {
        // usamos import dinámico porque app.js no es módulo
        const { getAuth, signOut } = await import("https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js");
        const auth = getAuth();
        await signOut(auth);
      } catch (err) {
        console.warn('No se pudo cerrar en Firebase (o no estaba logueado):', err);
      }

      // limpiar storage de la app
      localStorage.removeItem('cr_auth');

      // feedback
      if (window.mostrarAlerta) {
        window.mostrarAlerta('Sesión cerrada', 'success', { titulo: 'Listo' });
      }

      // redirigir
      window.location.href = '/index.html';
    });
  });
});



})();

document.addEventListener("DOMContentLoaded", () => {
  const avatars = document.querySelectorAll(".avatar-sm, .avatar-lg");
  avatars.forEach(av => {
    av.innerHTML = `<img src="../src/img/favicon.png" alt="CityRepair logo" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
    av.style.background = "none";
  });
});

