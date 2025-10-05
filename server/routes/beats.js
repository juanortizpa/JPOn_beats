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
router.post('/', authenticateToken, upload, async (req, res) => {
  const { title } = req.body;
  const file = req.file;

  if (!title || !file) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  // Subir archivo a Supabase Storage
  const { data, error: uploadError } = await supabase.storage
    .from('beats')
    .upload(`public/${file.originalname}`, file.buffer, {
      contentType: file.mimetype,
      upsert: true
    });

  if (uploadError) {
    return res.status(500).json({ error: 'Error al subir el archivo a Supabase' });
  }

  const fileUrl = data.Key;

  // Guardar información del beat en la base de datos
  const { error: insertError } = await supabase
    .from('beats')
    .insert({
      title,
      file_url: fileUrl,
      user_id: req.user.id
    });

  if (insertError) {
    return res.status(500).json({ error: 'Error al guardar el beat en la base de datos' });
  }

  res.status(201).json({ message: 'Beat subido exitosamente' });
});

// Ruta para listar todos los beats
router.get('/', async (req, res) => {
  const { data, error } = await supabase.from('beats').select('*');

  if (error) {
    return res.status(500).json({ error: 'Error al obtener los beats' });
  }

  res.status(200).json(data);
});

module.exports = router;