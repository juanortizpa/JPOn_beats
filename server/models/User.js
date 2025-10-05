const db = require('./db');

// Agregar logs para depuración
console.log('Verificando existencia de la tabla de usuarios...');

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
      console.error('Error al crear/verificar la tabla de usuarios:', err.message);
    } else {
      console.log('Tabla de usuarios lista o ya existente.');
    }
  });
});

module.exports = {
  createUser: (username, password, callback) => {
    const query = `INSERT INTO users (username, password) VALUES (?, ?)`;
    db.run(query, [username, password], function (err) {
      if (err) {
        console.error('Error al crear usuario:', err.message);
      }
      callback(err, this ? this.lastID : null);
    });
  },

  findUserByUsername: (username, callback) => {
    const query = `SELECT * FROM users WHERE username = ?`;
    db.get(query, [username], (err, row) => {
      if (err) {
        console.error('Error al buscar usuario:', err.message);
      }
      callback(err, row);
    });
  }
};
