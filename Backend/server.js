const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   REGISTER
========================= */
app.post("/api/register", (req, res) => {
  let { email, password, role, nombre } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son obligatorios" });
  }

  email    = email.trim().toLowerCase();
  password = password.trim();
  role     = ["citizen", "tecnico"].includes(role) ? role : "citizen";

  db.query("SELECT id FROM usuarios WHERE email = ?", [email], (err, results) => {
    if (err) return res.status(500).json({ error: "Error del servidor" });

    if (results.length > 0) {
      return res.status(409).json({ error: "Este correo ya está registrado" });
    }

    db.query(
      "INSERT INTO usuarios (email, password, role, activo) VALUES (?, ?, ?, 1)",
      [email, password, role],
      (err, result) => {
        if (err) return res.status(500).json({ error: "Error al registrar usuario" });
        res.status(201).json({
          ok: true,
          user: { id: result.insertId, email, role }
        });
      }
    );
  });
});

/* =========================
   LOGIN
========================= */
app.post("/api/login", (req, res) => {

  let { email, password } = req.body;

  // Limpiar espacios
  email = email.trim();
  password = password.trim();

  db.query(
    "SELECT * FROM usuarios WHERE email = ?",
    [email],
    (err, results) => {

      if (err) {
        return res.status(500).json({
          error: "Error servidor"
        });
      }

      if (results.length === 0) {
        return res.status(401).json({
          error: "Usuario no encontrado"
        });
      }

      const user = results[0];

      if (user.password !== password) {
        return res.status(401).json({
          error: "Contraseña incorrecta"
        });
      }

      if (user.activo === 0) {
        return res.status(403).json({
          error: "Cuenta desactivada. Contactá al administrador."
        });
      }

      res.json({ user });
    }
  );
});

/* =========================
   CREAR REPORTE
========================= */
app.post("/api/reportes", (req, res) => {

  const {
    usuario_id,
    tipo,
    ubicacion,
    descripcion,
    zona,
    prioridad
  } = req.body;

  db.query(
    `INSERT INTO reportes
    (usuario_id, tipo, ubicacion, descripcion, zona, prioridad)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      usuario_id,
      tipo,
      ubicacion,
      descripcion,
      zona,
      prioridad
    ],
    (err, result) => {

      if (err) {
        return res.status(500).json({
          error: "Error al guardar"
        });
      }

      res.json({
        message: "Reporte creado",
        id: result.insertId
      });
    }
  );
});

/* =========================
   TODOS LOS REPORTES
========================= */
app.get("/api/reportes", (req, res) => {
  db.query(
    `SELECT r.*, u.email AS usuario_email
     FROM reportes r
     LEFT JOIN usuarios u ON u.id = r.usuario_id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error obteniendo reportes" });
      res.json(results);
    }
  );
});

/* =========================
   MIS REPORTES
========================= */
app.get("/api/mis-reportes/:usuario_id", (req, res) => {

  const { usuario_id } = req.params;

  db.query(
    "SELECT * FROM reportes WHERE usuario_id = ? ORDER BY fecha DESC",
    [usuario_id],
    (err, results) => {

      if (err) {
        return res.status(500).json({
          error: "Error obteniendo reportes"
        });
      }

      res.json(results);
    }
  );
});

/* =========================
   ELIMINAR REPORTE
========================= */
app.delete("/api/reportes/:id", (req, res) => {

  const { id } = req.params;

  db.query(
    "DELETE FROM reportes WHERE id = ?",
    [id],
    (err) => {

      if (err) {
        return res.status(500).json({
          error: "Error al eliminar"
        });
      }

      res.json({
        message: "Reporte eliminado"
      });
    }
  );
});

/* =========================
   ASIGNAR TÉCNICO
========================= */
app.put("/api/reportes/:id/asignar", (req, res) => {

  const { id } = req.params;
  const { tecnico_email } = req.body;

  db.query(
    "UPDATE reportes SET tecnico_email = ? WHERE id = ?",
    [tecnico_email, id],
    (err) => {

      if (err) {
        return res.status(500).json({
          error: "Error asignando técnico"
        });
      }

      res.json({
        message: "Técnico asignado"
      });
    }
  );
});

/* =========================
   REPORTES POR TÉCNICO
========================= */
app.get("/api/reportes/tecnico/:email", (req, res) => {

  const { email } = req.params;

  db.query(
    "SELECT * FROM reportes WHERE tecnico_email = ?",
    [email],
    (err, results) => {

      if (err) {
        return res.status(500).json({
          error: "Error obteniendo reportes"
        });
      }

      res.json(results);
    }
  );
});

/* =========================
   CAMBIAR ESTADO
========================= */
app.put("/api/reportes/:id/estado", (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  // Verificar que el reporte no esté ya resuelto
  db.query("SELECT estado FROM reportes WHERE id = ?", [id], (err, results) => {
    if (err) return res.status(500).json({ error: "Error verificando estado" });
    if (!results.length) return res.status(404).json({ error: "Reporte no encontrado" });

    if (results[0].estado === "resuelto") {
      return res.status(403).json({ error: "El reporte ya está resuelto y no puede modificarse" });
    }

    db.query("UPDATE reportes SET estado = ?, fecha_resuelto = IF(? = 'resuelto', NOW(), fecha_resuelto) WHERE id = ?",
      [estado, estado, id],
      (err) => {
        if (err) return res.status(500).json({ error: "Error actualizando estado" });
        res.json({ message: "Estado actualizado" });
      }
    );
  });
});

/* =========================
   OBTENER REPORTE POR ID
========================= */
app.get("/api/reportes/:id", (req, res) => {

  const { id } = req.params;

  db.query(
    "SELECT * FROM reportes WHERE id = ?",
    [id],
    (err, results) => {

      if (err) {
        return res.status(500).json({
          error: "Error obteniendo reporte"
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          error: "Reporte no encontrado"
        });
      }

      res.json(results[0]);
    }
  );
});

/* =========================
   EDITAR REPORTE
========================= */
app.put("/api/reportes/:id", (req, res) => {

  const { id } = req.params;
  const { tipo, zona, descripcion } = req.body;

  db.query(
    "UPDATE reportes SET tipo = ?, zona = ?, descripcion = ? WHERE id = ?",
    [tipo, zona, descripcion, id],
    (err) => {

      if (err) {
        return res.status(500).json({
          error: "Error actualizando reporte"
        });
      }

      res.json({ message: "Reporte actualizado" });
    }
  );
});

/* =========================
   OBTENER TÉCNICOS ACTIVOS (para selector de asignación)
========================= */
app.get("/api/tecnicos", (req, res) => {
  db.query(
    "SELECT id, email, activo FROM usuarios WHERE role = 'tecnico' AND activo = 1",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error obteniendo técnicos" });
      res.json(results);
    }
  );
});

/* =========================
   OBTENER TODOS LOS TÉCNICOS (para gestión del admin)
========================= */
app.get("/api/tecnicos/todos", (req, res) => {
  db.query(
    "SELECT id, email, activo FROM usuarios WHERE role = 'tecnico'",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error obteniendo técnicos" });
      res.json(results);
    }
  );
});

/* =========================
   OBTENER TODOS LOS USUARIOS
========================= */
app.get("/api/usuarios", (req, res) => {
  db.query(
    "SELECT id, email, role, activo FROM usuarios",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error obteniendo usuarios" });
      res.json(results);
    }
  );
});

/* =========================
   DESACTIVAR / REACTIVAR USUARIO
========================= */
app.put("/api/usuarios/:id/estado", (req, res) => {
  const { id } = req.params;
  const { activo } = req.body; // 0 = desactivar, 1 = reactivar

  if (activo !== 0 && activo !== 1) {
    return res.status(400).json({ error: "Valor de 'activo' inválido" });
  }

  db.query(
    "UPDATE usuarios SET activo = ? WHERE id = ?",
    [activo, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Error actualizando usuario" });
      res.json({ ok: true, activo });
    }
  );
});

/* =========================
   NOTIFICACIONES
========================= */

// Obtener IDs de reportes que ya tienen notificación enviada
app.get("/api/notificaciones/reportes-notificados", (req, res) => {
  db.query(
    "SELECT DISTINCT reporte_id FROM notificaciones",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error" });
      res.json(results.map(r => r.reporte_id));
    }
  );
});

// Enviar notificación al usuario
app.post("/api/notificaciones", (req, res) => {
  const { usuario_id, reporte_id, mensaje } = req.body;
  if (!usuario_id || !reporte_id || !mensaje) {
    return res.status(400).json({ error: "Faltan datos" });
  }
  db.query(
    "INSERT INTO notificaciones (usuario_id, reporte_id, mensaje) VALUES (?, ?, ?)",
    [usuario_id, reporte_id, mensaje],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error enviando notificación" });
      res.status(201).json({ ok: true, id: result.insertId });
    }
  );
});

// Obtener notificaciones de un usuario
app.get("/api/notificaciones/:usuario_id", (req, res) => {
  const { usuario_id } = req.params;
  db.query(
    `SELECT n.*, r.tipo as reporte_tipo, r.zona as reporte_zona
     FROM notificaciones n
     LEFT JOIN reportes r ON r.id = n.reporte_id
     WHERE n.usuario_id = ?
     ORDER BY n.fecha DESC`,
    [usuario_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error obteniendo notificaciones" });
      res.json(results);
    }
  );
});

// Marcar notificación como leída
app.put("/api/notificaciones/:id/leer", (req, res) => {
  db.query(
    "UPDATE notificaciones SET leida = 1 WHERE id = ?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Error actualizando notificación" });
      res.json({ ok: true });
    }
  );
});

/* =========================
   MENSAJES TÉCNICO → ADMIN
========================= */
app.post("/api/mensajes-admin", (req, res) => {
  const { tecnico_email, reporte_id, mensaje, tipo, horas } = req.body;
  if (!tecnico_email || !reporte_id || !mensaje || !tipo) {
    return res.status(400).json({ error: "Faltan datos" });
  }
  db.query(
    "INSERT INTO mensajes_admin (tecnico_email, reporte_id, mensaje, tipo, horas) VALUES (?, ?, ?, ?, ?)",
    [tecnico_email, reporte_id, mensaje, tipo, horas || null],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error guardando mensaje" });
      res.status(201).json({ ok: true, id: result.insertId });
    }
  );
});

app.get("/api/mensajes-admin", (req, res) => {
  db.query(
    `SELECT m.*, r.tipo as reporte_tipo
     FROM mensajes_admin m
     LEFT JOIN reportes r ON r.id = m.reporte_id
     ORDER BY m.fecha DESC`,
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error obteniendo mensajes" });
      res.json(results);
    }
  );
});

app.put("/api/mensajes-admin/:id/leer", (req, res) => {
  db.query("UPDATE mensajes_admin SET leido = 1 WHERE id = ?", [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ error: "Error" });
      res.json({ ok: true });
    }
  );
});

/* =========================
   INICIAR SERVIDOR
========================= */
app.listen(3000, () => {
  console.log("🚀 Servidor en http://localhost:3000");
});