const express = require('express');
const Beat = require('../models/Beat');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extraer el token después de "Bearer"

  if (!token) return res.status(401).json({ error: 'Token requerido' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token inválido' });
    req.user = user;
    next();
  });
};

// Ruta para subir un beat
router.post('/', authenticateToken, (req, res) => {
  const { title, filePath } = req.body;
  const authorId = req.user.id;

  if (!title || !filePath) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  Beat.createBeat(title, filePath, authorId, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al subir el beat' });
    }
    res.status(201).json({ message: 'Beat subido exitosamente' });
  });
});

// Ruta para listar todos los beats
router.get('/', (req, res) => {
  Beat.getAllBeats((err, beats) => {
    if (err) {
      return res.status(500).json({ error: 'Error al obtener los beats' });
    }
    res.json(beats);
  });
});

module.exports = router;