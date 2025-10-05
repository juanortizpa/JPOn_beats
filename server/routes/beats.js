const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { supabase } = require('../supabase');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Configuración de multer (en memoria)
const storage = multer.memoryStorage();
const upload = multer({ storage }).single('file');

// Middleware para verificar el token JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    console.error('Error: Token requerido');
    return res.status(401).json({ error: 'Token requerido' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('Error: Token inválido');
      return res.status(403).json({ error: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Ruta para subir un beat
router.post('/', authenticateToken, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Error en multer:', err.message);
      return res.status(500).json({ error: 'Error al procesar archivo' });
    }

    const { title } = req.body;
    const file = req.file;

    if (!title || !file) {
      console.error('Error: Faltan datos requeridos');
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    try {
      // Subir archivo a Supabase Storage
      const { data, error } = await supabase.storage
        .from('beats')
        .upload(`${Date.now()}_${file.originalname}`, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (error) {
        console.error('Error al subir archivo a Supabase:', error.message);
        return res.status(500).json({ error: 'Error al subir el archivo' });
      }

      const fileUrl = data.path;

      // Guardar info en la tabla beats
      const { error: insertError } = await supabase.from('beats').insert({
        title,
        file_url: fileUrl,
        user_id: req.user.id
      });

      if (insertError) {
        console.error('Error al guardar beat en la base de datos:', insertError.message);
        return res.status(500).json({ error: 'Error al guardar el beat en la base de datos' });
      }

      console.log('Beat subido exitosamente:', title);
      return res.status(201).json({ message: 'Beat subido exitosamente' });

    } catch (err) {
      console.error('Error inesperado en /beats:', err.message);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }
  });
});

// Ruta para listar todos los beats
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('beats').select('*');

    if (error) {
      console.error('Error al obtener beats:', error.message);
      return res.status(500).json({ error: 'Error al obtener los beats' });
    }

    console.log('Beats obtenidos correctamente');
    return res.status(200).json(data);

  } catch (err) {
    console.error('Error inesperado en GET /beats:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
