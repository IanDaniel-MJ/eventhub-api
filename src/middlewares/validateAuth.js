const ApiError = require('../utils/ApiError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{6}$/;

// Valida los campos obligatorios y formatos al registrar un usuario
const validateRegister = (req, res, next) => {
  const { nombre, email, password } = req.body || {};

  if (!nombre || typeof nombre !== 'string' || !nombre.trim()) {
    return next(
      new ApiError(400, 'VALIDATION_ERROR', 'El campo nombre es obligatorio.', {
        messageKey: 'validation.auth.nombreRequired'
      })
    );
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return next(
      new ApiError(
        400,
        'VALIDATION_ERROR',
        'El campo email debe tener un formato válido.',
        { messageKey: 'validation.auth.emailInvalid' }
      )
    );
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return next(
      new ApiError(
        400,
        'VALIDATION_ERROR',
        'El campo password es obligatorio y debe tener al menos 6 caracteres.',
        { messageKey: 'validation.auth.passwordMinLength' }
      )
    );
  }

  return next();
};

// Valida que existan correo y contraseña válidos antes de evaluar credenciales
const validateLogin = (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return next(
      new ApiError(400, 'VALIDATION_ERROR', 'Debes proporcionar un email válido.', {
        messageKey: 'validation.auth.loginEmailInvalid'
      })
    );
  }

  if (!password || typeof password !== 'string' || !password.trim()) {
    return next(
      new ApiError(400, 'VALIDATION_ERROR', 'El campo password es obligatorio.', {
        messageKey: 'validation.auth.passwordRequired'
      })
    );
  }

  return next();
};

// Valida el token temporal y el código numérico de 6 dígitos para el paso 2FA
const validateVerify2FA = (req, res, next) => {
  const { tempToken, code } = req.body || {};

  if (!tempToken || typeof tempToken !== 'string' || !tempToken.trim()) {
    return next(
      new ApiError(400, 'VALIDATION_ERROR', 'El campo tempToken es obligatorio.', {
        messageKey: 'validation.auth.tempTokenRequired'
      })
    );
  }

  const normalizedCode = code !== undefined && code !== null ? String(code).trim() : '';

  if (!OTP_REGEX.test(normalizedCode)) {
    return next(
      new ApiError(
        400,
        'VALIDATION_ERROR',
        'El campo code es obligatorio y debe ser un código numérico de 6 dígitos.',
        { messageKey: 'validation.auth.otpInvalid' }
      )
    );
  }

  req.body.code = normalizedCode;
  return next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateVerify2FA
};