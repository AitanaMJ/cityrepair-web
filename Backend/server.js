const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* LOGIN */
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

/* REGISTRO */
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

/* CREAR REPORTE */
app.post("/api/reportes", (req, res) => {
  const { usuario_id, tipo, ubicacion, descripcion, zona, prioridad } = req.body;

  db.query(
    `INSERT INTO reportes (usuario_id, tipo, ubicacion, descripcion, zona, prioridad)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [usuario_id, tipo, ubicacion, descripcion, zona, prioridad],
    (err) => {
      if (err) return res.status(500).json({ error: "Error al guardar reporte" });

      res.json({ message: "Reporte creado" });
    }
  );
});

app.listen(3000, () => {
  console.log("🚀 Servidor en http://localhost:3000");
});