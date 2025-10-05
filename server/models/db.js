const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Ruta de la base de datos desde .env
const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../../database/db.sqlite');

// Agregar logs para depuración
console.log('Ruta de la base de datos:', dbPath);

// Verificar existencia del archivo de base de datos
if (!fs.existsSync(dbPath)) {
  console.error('Error: El archivo de la base de datos no existe en la ruta especificada:', dbPath);
} else {
  console.log('El archivo de la base de datos existe.');
}

// Crear conexión a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error al conectar con la base de datos:', err.message);
  } else {
    console.log('Conexión a la base de datos SQLite establecida.');
  }
});

module.exports = db;