const db = require('./db');

// Crear tabla de usuarios si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear la tabla de usuarios:', err.message);
    } else {
      console.log('Tabla de usuarios lista.');
    }
  });
});

module.exports = {
  createUser: (username, password, callback) => {
    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(query, [username, password], callback);
  },
  findUserByUsername: (username, callback) => {
    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], callback);
  }
};