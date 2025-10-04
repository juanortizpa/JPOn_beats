const db = require('./db');

// Crear tabla de beats si no existe
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS beats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      file_path TEXT NOT NULL,
      author_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id)
    )
  `, (err) => {
    if (err) {
      console.error('Error al crear la tabla de beats:', err.message);
    } else {
      console.log('Tabla de beats lista.');
    }
  });
});

module.exports = {
  createBeat: (title, filePath, authorId, callback) => {
    const query = `INSERT INTO beats (title, file_path, author_id) VALUES (?, ?, ?)`;
    db.run(query, [title, filePath, authorId], callback);
  },
  getAllBeats: (callback) => {
    const query = `SELECT * FROM beats`;
    db.all(query, [], callback);
  }
};