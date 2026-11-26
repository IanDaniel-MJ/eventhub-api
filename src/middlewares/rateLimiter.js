const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

// Obtiene la ventana de tiempo y los límites desde variables de entorno o usa valores por defecto
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000;
const GLOBAL_MAX = Number(process.env.RATE_LIMIT_MAX) || 60;
const AUTH_MAX = Number(process.env.AUTH_RATE_LIMIT_MAX) || 10;

// Construye un manejador estandarizado que delega el error 429 al errorHandler global
const createLimitHandler = (message, messageKey) => (req, res, next) => {
  next(new ApiError(429, 'RATE_LIMIT_EXCEEDED', message, { messageKey }));
};

// Restringe el máximo de peticiones por minuto por IP para toda la API (/api/v1)
const globalLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: GLOBAL_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createLimitHandler(
    'Has excedido el límite de peticiones por minuto. Intenta nuevamente más tarde.',
    'errors.RATE_LIMIT_GLOBAL'
  )
});

// Restringe de forma más estricta las rutas de autenticación (/api/v1/auth) contra fuerza bruta
const authLimiter = rateLimit({
  windowMs: WINDOW_MS,
  limit: AUTH_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createLimitHandler(
    'Demasiados intentos de autenticación. Espera un minuto antes de volver a intentarlo.',
    'errors.RATE_LIMIT_AUTH'
  )
});

module.exports = {
  globalLimiter,
  authLimiter
};