const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Ruta para registrar usuarios
router.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    User.createUser(username, hashedPassword, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al registrar usuario' });
      }
      res.status(201).json({ message: 'Usuario registrado exitosamente' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para login de usuarios
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  User.findUserByUsername(username, async (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  });
});

module.exports = router;