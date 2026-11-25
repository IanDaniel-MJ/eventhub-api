const express = require('express');
const logger = require('./middlewares/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const healthRoutes = require('./routes/health.routes');
const speakersRoutes = require('./routes/speakers.routes');
const { globalLimiter } = require('./middlewares/rateLimiter');
const authRoutes = require('./routes/auth.routes');
const authenticate = require('./middlewares/authenticate');

const app = express();

// Registra cada petición entrante con su método, ruta, estado y duración
app.use(logger);
// Aplica el límite máximo de peticiones por minuto a todas las rutas de la API
app.use('/api/v1', globalLimiter);

// Parsea los cuerpos JSON de las peticiones entrantes
app.use(express.json());

// Rutas de la API
app.use('/api/v1/health', healthRoutes);
// Protege todos los endpoints de ponentes exigiendo un JWT de acceso válido
app.use('/api/v1/speakers', authenticate, speakersRoutes);

// Monta las rutas de registro y autenticación en dos pasos
app.use('/api/v1/auth', authRoutes);

// Captura cualquier ruta no registrada y la delega como error 404
app.use(notFound);

// Centraliza y estandariza todas las respuestas de error en formato JSON
app.use(errorHandler);

module.exports = app;