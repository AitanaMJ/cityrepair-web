const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// CONEXIÓN A MYSQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'sqlpromo2026', // poné tu contraseña si tenés
    database: 'cityrepair'
});

db.connect(err => {
    if (err) {
        console.error('Error de conexión:', err);
    } else {
        console.log('Conectado a MySQL');
    }
});


// =========================
// RUTAS
// =========================

// Obtener usuarios
app.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

// Crear usuario
app.post('/usuarios', (req, res) => {
    const { nombre, email, password, id_rol } = req.body;

    const sql = 'INSERT INTO usuarios (nombre,email,password,id_rol) VALUES (?,?,?,?)';

    db.query(sql, [nombre, email, password, id_rol], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ mensaje: 'Usuario creado' });
    });
});

// Eliminar usuario
app.delete('/usuarios/:id', (req, res) => {
    db.query('DELETE FROM usuarios WHERE id_usuario = ?', 
    [req.params.id], 
    (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ mensaje: 'Usuario eliminado' });
    });
});

app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});
