const express = require('express');
const logger = require('./middlewares/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const healthRoutes = require('./routes/health.routes');
const speakersRoutes = require('./routes/speakers.routes');

const app = express();

// Registra cada petición entrante con su método, ruta, estado y duración
app.use(logger);

// Parsea los cuerpos JSON de las peticiones entrantes
app.use(express.json());

// Rutas de la API
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/speakers', speakersRoutes);

// Captura cualquier ruta no registrada y la delega como error 404
app.use(notFound);

// Centraliza y estandariza todas las respuestas de error en formato JSON
app.use(errorHandler);

module.exports = app;