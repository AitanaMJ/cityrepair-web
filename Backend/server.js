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
   CREAR REPORTE
========================= */
app.post("/api/reportes", (req, res) => {
  const { usuario_id, tipo, ubicacion, descripcion, zona, prioridad } = req.body;

  db.query(
    `INSERT INTO reportes (usuario_id, tipo, ubicacion, descripcion, zona, prioridad)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuario_id, tipo, ubicacion, descripcion, zona, prioridad],
    (err) => {
      if (err) return res.status(500).json({ error: "Error al guardar" });
      res.json({ message: "Reporte creado" });
    }
  );
});

/* =========================
   TODOS LOS REPORTES
========================= */
app.get("/api/reportes", (req, res) => {
  db.query("SELECT * FROM reportes", (err, results) => {
    if (err) return res.status(500).json({ error: "Error" });
    res.json(results);
  });
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
      if (err) return res.status(500).json({ error: "Error asignando" });
      res.json({ message: "Asignado" });
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
      if (err) return res.status(500).json({ error: "Error" });
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
      if (err) return res.status(500).json({ error: "Error estado" });
      res.json({ message: "Estado actualizado" });
    }
  );
});

app.listen(3000, () => {
  console.log("🚀 Servidor en http://localhost:3000");
});