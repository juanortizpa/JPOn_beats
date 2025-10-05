const express = require('express');
const { supabase } = require('../supabase');

const router = express.Router();

// Ruta para registrar usuarios
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  console.log('Datos recibidos para registro:', { email, password });

  if (!email || !password) {
    console.error('Error: Faltan datos requeridos');
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });

    if (error) {
      console.error('Error en Supabase al registrar usuario:', error.message);
      return res.status(500).json({ error: error.message });
    }

    console.log('Usuario registrado exitosamente:', data);
    return res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: data.user
    });
  } catch (err) {
    console.error('Error inesperado en /register:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para login de usuarios
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Datos recibidos para login:', { email, password });

  if (!email || !password) {
    console.error('Error: Faltan datos requeridos');
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error en Supabase al iniciar sesión:', error.message);
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log('Inicio de sesión exitoso:', data);
    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      session: data.session,
      user: data.user
    });
  } catch (err) {
    console.error('Error inesperado en /login:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
