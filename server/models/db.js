const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Ruta de la base de datos desde .env
const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../database/db.sqlite');

// Crear conexión a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conexión a la base de datos SQLite establecida.');
  }
});

module.exports = db;