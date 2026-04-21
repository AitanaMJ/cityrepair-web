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
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM usuarios WHERE email = ? AND password = ?",
    [email, password],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Error servidor" });

      if (results.length === 0) {
        return res.status(401).json({ error: "Credenciales inválidas" });
      }

      res.json({ user: results[0] });
    }
  );
});

/* =========================
   REGISTRO
========================= */
app.post("/api/register", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "INSERT INTO usuarios (email, password) VALUES (?, ?)",
    [email, password],
    (err) => {
      if (err) return res.status(500).json({ error: "Error al registrar" });

      res.json({ message: "Usuario creado" });
    }
  );
});

/* =========================
   CREAR REPORTE
========================= */
app.post("/api/reportes", (req, res) => {
  const { usuario_id, tipo, ubicacion, descripcion, zona, prioridad } = req.body;

  db.query(
    `INSERT INTO reportes (usuario_id, tipo, ubicacion, descripcion, zona, prioridad)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuario_id, tipo, ubicacion, descripcion, zona, prioridad],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al guardar reporte" });
      }

      res.json({ message: "Reporte creado" });
    }
  );
});

/* =========================
   OBTENER TODOS LOS REPORTES
========================= */
app.get("/api/reportes", (req, res) => {
  db.query("SELECT * FROM reportes", (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener reportes" });

    res.json(results);
  });
});

/* =========================
   ASIGNAR REPORTE A TÉCNICO
========================= */
app.put("/api/reportes/:id/asignar", (req, res) => {
  const { id } = req.params;
  const { tecnico_email } = req.body;

  db.query(
    "UPDATE reportes SET tecnico_email = ? WHERE id = ?",
    [tecnico_email, id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al asignar reporte" });
      }

      res.json({ message: "Reporte asignado" });
    }
  );
});

/* =========================
   VER REPORTES DE UN TÉCNICO
========================= */
app.get("/api/reportes/tecnico/:email", (req, res) => {
  const { email } = req.params;

  db.query(
    "SELECT * FROM reportes WHERE tecnico_email = ?",
    [email],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al obtener reportes" });
      }

      res.json(results);
    }
  );
});

/* =========================
   CAMBIAR ESTADO DEL REPORTE
========================= */
app.put("/api/reportes/:id/estado", (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  db.query(
    "UPDATE reportes SET estado = ? WHERE id = ?",
    [estado, id],
    (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Error al actualizar estado" });
      }

      res.json({ message: "Estado actualizado" });
    }
  );
});

/* =========================
   INICIAR SERVIDOR
========================= */
app.listen(3000, () => {
  console.log("🚀 Servidor en http://localhost:3000");
});