const express = require('express');
const logger = require('./middlewares/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Registra cada petición entrante con su método, ruta, estado y duración
app.use(logger);

// Parsea los cuerpos JSON de las peticiones entrantes
app.use(express.json());

// Captura cualquier ruta no registrada y la delega como error 404
app.use(notFound);

// Centraliza y estandariza todas las respuestas de error en formato JSON
app.use(errorHandler);

module.exports = app;