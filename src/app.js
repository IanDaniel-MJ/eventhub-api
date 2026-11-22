const express = require('express');

const app = express();

// Parsea los cuerpos JSON de las peticiones entrantes
app.use(express.json());

module.exports = app;