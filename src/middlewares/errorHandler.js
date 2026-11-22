const ApiError = require('../utils/ApiError');

// Centraliza y estandariza todas las respuestas de error de la API
const errorHandler = (err, req, res, next) => {
  let status = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = 'Ocurrió un error interno en el servidor';

  // Evalúa si es un error controlado de negocio o de validación
  if (err instanceof ApiError) {
    status = err.status;
    code = err.code;
    message = err.message;
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Detecta errores de sintaxis cuando el cliente envía un JSON mal formado
    status = 400;
    code = 'VALIDATION_ERROR';
    message = 'El cuerpo de la petición contiene un JSON inválido';
  } else {
    // Registra el detalle completo en consola para depuración interna sin exponerlo al cliente
    console.error('[ERROR NO CONTROLADO]:', err);
  }

  // Construye y envía la respuesta con el formato JSON estándar acordado
  return res.status(status).json({
    error: {
      status,
      code,
      message,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = errorHandler;