// src/js/edet-register.js

// validaciones básicas
const emailOK = (email) => /@edet\.com\.ar$/i.test(email);
const eidOK   = (eid)   => /^EDET-\d{5,6}$/i.test(eid);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('edetRegisterForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre   = document.getElementById('rNombre').value.trim();
    const apellido = document.getElementById('rApellido').value.trim();
    const eid      = document.getElementById('rEid').value.trim();
    const depto    = document.getElementById('rDepto').value.trim();
    const tel      = document.getElementById('rTel').value.trim();
    const email    = document.getElementById('rEmail').value.trim();
    const pass     = document.getElementById('rPass').value.trim();

    // 1) validaciones de frontend
    if (!nombre || !apellido || !depto) {
      window.mostrarAlerta?.('Completá todos los campos obligatorios', 'danger', { titulo: 'Error' });
      return;
    }
    if (!emailOK(email)) {
      window.mostrarAlerta?.('Usá tu correo corporativo @edet.com.ar', 'danger', { titulo: 'Email inválido' });
      return;
    }
    if (!eidOK(eid)) {
      window.mostrarAlerta?.('ID de empleado inválido. Formato: EDET-000123', 'danger', { titulo: 'ID inválido' });
      return;
    }
    if (pass.length < 6) {
      window.mostrarAlerta?.('La contraseña debe tener al menos 6 caracteres', 'danger', { titulo: 'Contraseña muy corta' });
      return;
    }

    try {
      // 2) comprobar que el ID exista en /edet-ids
      const eidSnap = await getDoc(doc(db, "edet-ids", eid));
      if (!eidSnap.exists()) {
        window.mostrarAlerta?.('Ese ID de EDET no está habilitado', 'danger', { titulo: 'ID no válido' });
        return;
      }
      const dataEid = eidSnap.data();
      if (dataEid.usado === true) {
        window.mostrarAlerta?.('Ese ID ya fue usado', 'danger', { titulo: 'ID en uso' });
        return;
      }

      // 3) crear usuario en Auth
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const uid = cred.user.uid;

      // 4) guardar datos del usuario
      await setDoc(doc(db, 'usuarios', uid), {
        rol: 'edet',
        nombre,
        apellido,
        eid,
        depto,
        tel,
        email,
        creadoEn: new Date()
      });

      // 👉 aquí YA NO intentamos escribir en /edet-ids

      window.mostrarAlerta?.('Registro EDET completo', 'success', { titulo: 'Listo' });
      setTimeout(() => {
        window.location.href = './edet-dashboard.html';
      }, 900);

    } catch (err) {
      console.error('Error al registrar EDET:', err);
      window.mostrarAlerta?.('No se pudo registrar el administrador', 'danger', { titulo: 'Error' });
    }
  });
});

