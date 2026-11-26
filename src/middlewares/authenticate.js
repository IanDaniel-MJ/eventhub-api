const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');

// Obtiene la clave secreta para verificar JWT desde variables de entorno
const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'eventhub_dev_secret_key';
};

// Valida el token Bearer de acceso y bloquea tokens temporales o inválidos
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new ApiError(
        401,
        'TOKEN_MISSING',
        'Se requiere un token de acceso en la cabecera Authorization (Bearer).',
        { messageKey: 'errors.TOKEN_MISSING' }
      )
    );
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return next(
      new ApiError(
        401,
        'TOKEN_MISSING',
        'El token de acceso no puede estar vacío.',
        { messageKey: 'errors.TOKEN_EMPTY' }
      )
    );
  }

  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(
        new ApiError(
          401,
          'TOKEN_EXPIRED',
          'El token de acceso ha expirado. Inicia sesión nuevamente.',
          { messageKey: 'errors.TOKEN_EXPIRED' }
        )
      );
    }

    return next(
      new ApiError(401, 'TOKEN_INVALID', 'El token de acceso no es válido.', {
        messageKey: 'errors.TOKEN_INVALID'
      })
    );
  }

  // Impide saltarse el flujo 2FA enviando el tempToken a rutas protegidas
  if (payload.type !== 'access') {
    return next(
      new ApiError(
        401,
        'TOKEN_INVALID',
        'El token proporcionado no es un token de acceso válido. Completa la verificación 2FA.',
        { messageKey: 'errors.TOKEN_NOT_ACCESS' }
      )
    );
  }

  // Adjunta la identidad del usuario autenticado para los controladores posteriores
  req.user = {
    id: payload.sub,
    email: payload.email,
    rol: payload.rol
  };

  return next();
};

module.exports = authenticate;