// src/js/perfil.js
// ===============================
// PERFIL DE USUARIO - SIN FIREBASE
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const sessionRaw = localStorage.getItem("cr_auth");
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;

  if (!session || session.role !== "usuario") {
    window.location.href = "./login.html";
    return;
  }

  // ==== Elementos del DOM ====
  const fotoPerfil = document.getElementById("fotoPerfil");
  const nombrePerfil = document.getElementById("nombrePerfil");
  const emailPerfil = document.getElementById("emailPerfil");

  const uidPerfil = document.getElementById("perfilUID");
  const creacionPerfil = document.getElementById("perfilCreacion");
  const ultimoLoginPerfil = document.getElementById("perfilUltimoLogin");

  const totalReportesEl = document.getElementById("perfilTotalReportes");
  const pendientesEl = document.getElementById("perfilPendientes");
  const resueltosEl = document.getElementById("perfilResueltos");

  const btnCambiarFoto = document.getElementById("btnCambiarFoto");
  const inputFoto = document.getElementById("inputFoto");

  // ===============================
  // DATOS BÁSICOS DESDE SESSION
  // ===============================
  fotoPerfil.src = session.photoURL || "../src/img/default-avatar.png";
  nombrePerfil.textContent = session.nombre || "Usuario";
  emailPerfil.textContent = session.email || "";

  uidPerfil.textContent = session.uid || "local-user";
  creacionPerfil.textContent = session.creationTime || "N/A";
  ultimoLoginPerfil.textContent = session.lastLogin || new Date().toLocaleString();

  // ===============================
  // ESTADÍSTICAS DESDE localStorage
  // ===============================
  const reportes = JSON.parse(localStorage.getItem("cr_reportes")) || [];

  let total = 0;
  let pendientes = 0;
  let resueltos = 0;

  reportes.forEach((rep) => {
    if (rep.usuarioId === session.uid) {
      total++;

      const estado = (rep.estado || "pendiente").toLowerCase();
      if (estado === "pendiente") pendientes++;
      if (estado === "resuelto") resueltos++;
    }
  });

  totalReportesEl.textContent = total;
  pendientesEl.textContent = pendientes;
  resueltosEl.textContent = resueltos;

  // ===============================
  // CAMBIO DE FOTO (base64 local)
  // ===============================
  if (btnCambiarFoto && inputFoto) {
    btnCambiarFoto.addEventListener("click", () => inputFoto.click());

    inputFoto.addEventListener("change", (e) => {
      const archivo = e.target.files[0];
      if (!archivo) return;

      const reader = new FileReader();

      reader.onload = function (event) {
        const base64 = event.target.result;

        // actualizar sesión
        session.photoURL = base64;
        localStorage.setItem("cr_auth", JSON.stringify(session));

        fotoPerfil.src = base64;

        if (typeof window.mostrarAlerta === "function") {
          window.mostrarAlerta("Foto actualizada correctamente.", "success");
        } else {
          alert("Foto actualizada correctamente.");
        }
      };

      reader.readAsDataURL(archivo);
    });
  }
});