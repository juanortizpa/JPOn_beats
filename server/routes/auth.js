const express = require('express');
const { supabase } = require('../supabase');

const router = express.Router();

// Ruta para registrar usuarios
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'Usuario registrado exitosamente', user: data.user });
});

// Ruta para login de usuarios
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  res.status(200).json({ message: 'Inicio de sesión exitoso', session: data.session });
});

module.exports = router;