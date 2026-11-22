const express = require('express');
const logger = require('./middlewares/logger');

const app = express();

// Registra cada petición entrante con su método, ruta, estado y duración
app.use(logger);

// Parsea los cuerpos JSON de las peticiones entrantes
app.use(express.json());

module.exports = app;