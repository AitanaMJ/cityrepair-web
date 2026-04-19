const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sqlpromo2026",
  database: "cityrepair"
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Error conectando a MySQL:", err);
  } else {
    console.log("✅ Conectado a MySQL");
  }
});

module.exports = connection;