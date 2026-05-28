const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

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
    "SELECT * FROM reportes",
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

  db.query(
    "UPDATE reportes SET estado = ? WHERE id = ?",
    [estado, id],
    (err) => {

      if (err) {
        return res.status(500).json({
          error: "Error actualizando estado"
        });
      }

      res.json({
        message: "Estado actualizado"
      });
    }
  );
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
   OBTENER TÉCNICOS
========================= */
app.get("/api/tecnicos", (req, res) => {
  db.query(
    "SELECT id, email FROM usuarios WHERE role = 'tecnico'",
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error obteniendo técnicos" });
      res.json(results);
    }
  );
});

/* =========================
   INICIAR SERVIDOR
========================= */
app.listen(3000, () => {
  console.log("🚀 Servidor en http://localhost:3000");
});