// src/js/edet-register.js

// validaciones básicas
const emailOK = (email) => /@edet\.com\.ar$/i.test(email);
const eidOK   = (eid)   => /^EDET-\d{5,6}$/i.test(eid);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('edetRegisterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre   = document.getElementById('rNombre').value.trim();
    const apellido = document.getElementById('rApellido').value.trim();
    const eid      = document.getElementById('rEid').value.trim();
    const depto    = document.getElementById('rDepto').value.trim();
    const tel      = document.getElementById('rTel').value.trim();
    const email    = document.getElementById('rEmail').value.trim();
    const pass     = document.getElementById('rPass').value.trim();

    // 1️⃣ Validaciones
    if (!nombre || !apellido || !depto) {
      window.mostrarAlerta?.('Completá todos los campos obligatorios', 'danger', { titulo: 'Error' });
      return;
    }

    if (!emailOK(email)) {
      window.mostrarAlerta?.('Usá tu correo corporativo @edet.com.ar', 'danger', { titulo: 'Email inválido' });
      return;
    }

    if (!eidOK(eid)) {
      window.mostrarAlerta?.('ID inválido. Formato: EDET-000123', 'danger', { titulo: 'ID inválido' });
      return;
    }

    if (pass.length < 6) {
      window.mostrarAlerta?.('La contraseña debe tener al menos 6 caracteres', 'danger', { titulo: 'Contraseña muy corta' });
      return;
    }

    try {
      // 2️⃣ Obtener usuarios guardados
      const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

      // 3️⃣ Verificar que no exista el email
      const existeEmail = usuarios.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (existeEmail) {
        window.mostrarAlerta?.('Ese email ya está registrado', 'danger', { titulo: 'Duplicado' });
        return;
      }

      // 4️⃣ Verificar que no exista el EID
      const existeEid = usuarios.some(u => u.eid.toLowerCase() === eid.toLowerCase());
      if (existeEid) {
        window.mostrarAlerta?.('Ese ID ya fue usado', 'danger', { titulo: 'ID en uso' });
        return;
      }

      // 5️⃣ Crear usuario
      const nuevoUsuario = {
        id: Date.now().toString(),
        rol: "edet", // o "admin" si querés
        nombre,
        apellido,
        eid,
        depto,
        tel,
        email,
        password: pass,
        creadoEn: new Date().toISOString()
      };

      usuarios.push(nuevoUsuario);
      localStorage.setItem("usuarios", JSON.stringify(usuarios));

      // 6️⃣ Crear sesión automáticamente
      localStorage.setItem("session", JSON.stringify({
        email,
        rol: nuevoUsuario.rol
      }));

      window.mostrarAlerta?.('Registro EDET completo', 'success', { titulo: 'Listo' });

      setTimeout(() => {
        window.location.href = './edet-dashboard.html';
      }, 900);

    } catch (err) {
      console.error('Error al registrar:', err);
      window.mostrarAlerta?.('No se pudo registrar el usuario', 'danger', { titulo: 'Error' });
    }
  });
});

