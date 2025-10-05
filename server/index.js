// Importar dependencias
const express = require('express');
const dotenv = require('dotenv');
const path = require('path');

// Configurar variables de entorno
dotenv.config();

// Crear la aplicación de Express
const app = express();

// Configurar el puerto desde .env o usar 3000 por defecto
const PORT = process.env.PORT || 3000;

const cors = require('cors');
// Configurar CORS para permitir solicitudes desde cualquier origen
app.use(cors());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../app')));

const authRoutes = require('./routes/auth');
const beatRoutes = require('./routes/beats');

// Middleware para manejar JSON
app.use(express.json());

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/beats', beatRoutes);

// Ruta básica para verificar que el servidor funciona
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando correctamente' });
});

// Ruta para verificar conexión a la base de datos
app.get('/api/db-check', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);

    if (error) {
      console.error('Error al conectar con la base de datos:', error.message);
      return res.status(500).json({ status: 'error', message: 'No se pudo conectar con la base de datos', error: error.message });
    }

    res.status(200).json({ status: 'ok', message: 'Conexión exitosa a la base de datos', data });
  } catch (err) {
    console.error('Error inesperado:', err);
    res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});