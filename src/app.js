const express = require('express');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Parsea los cuerpos JSON de las peticiones entrantes
app.use(express.json());

// Captura cualquier ruta no registrada y la delega como error 404
app.use(notFound);

// Centraliza y estandariza todas las respuestas de error en formato JSON
app.use(errorHandler);

module.exports = app;