const ApiError = require('../utils/ApiError');

// Captura cualquier petición que no coincidió con ninguna ruta registrada
const notFound = (req, res, next) => {
  const error = new ApiError(
    404,
    'ROUTE_NOT_FOUND',
    `No se encontró la ruta ${req.method} ${req.originalUrl}.`,
    {
      messageKey: 'errors.ROUTE_NOT_FOUND',
      params: {
        method: req.method,
        path: req.originalUrl
      }
    }
  );

  // Envía el error al middleware global de manejo de errores
  next(error);
};

module.exports = notFound;