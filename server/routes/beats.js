const express = require('express');
const Beat = require('../models/Beat');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Configurar multer para manejar la subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads')); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

// Actualizar filtro para permitir archivos .wav y .mp3
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['audio/wav', 'audio/mpeg'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Tipo de archivo no permitido. Solo se aceptan archivos .wav y .mp3'));
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

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
router.post('/', authenticateToken, upload.single('file'), (req, res) => {
  const { title } = req.body;
  const authorId = req.user.id;

  if (!title || !req.file) {
    console.error('Error: Faltan datos requeridos o archivo no subido');
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  console.log('Archivo recibido:', req.file);
  const filePath = req.file.path;

  Beat.createBeat(title, filePath, authorId, (err) => {
    if (err) {
      console.error('Error al guardar el beat en la base de datos:', err);
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