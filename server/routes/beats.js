const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { supabase } = require('../supabase');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Configurar multer para manejar la subida de archivos
const storage = multer.memoryStorage(); // Cambiar a memoria para subir a Supabase

// Middleware para manejar errores de multer
const upload = multer({ storage }).single('file');

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
router.post('/', authenticateToken, async (req, res) => {
  const { title } = req.body;
  const file = req.file;

  if (!title || !file) {
    console.error('Error: Faltan datos requeridos');
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const { data, error } = await supabase.storage.from('beats').upload(file.originalname, file.buffer);

  if (error) {
    console.error('Error al subir el archivo:', error.message);
    return res.status(500).json({ error: 'Error al subir el archivo' });
  }

  const fileUrl = data.path;

  const { error: insertError } = await supabase.from('beats').insert({
    title,
    file_url: fileUrl,
    user_id: req.user.id
  });

  if (insertError) {
    console.error('Error al guardar el beat en la base de datos:', insertError.message);
    return res.status(500).json({ error: 'Error al guardar el beat en la base de datos' });
  }

  res.status(201).json({ message: 'Beat subido exitosamente' });
});

// Ruta para listar todos los beats
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('beats').select('*');

  if (error) {
    console.error('Error al obtener los beats:', error.message);
    return res.status(500).json({ error: 'Error al obtener los beats' });
  }

  res.status(200).json(data);
});

module.exports = router;