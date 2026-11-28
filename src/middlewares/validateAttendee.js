
const ApiError = require('../utils/ApiError');

// Middleware encargado de validar los datos de un asistente
// antes de permitir su registro.
const validateAttendee = (req, res, next) => {
  const { nombre, email, matricula, carrera } = req.body || {};

  if (
    typeof nombre !== 'string' || !nombre.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof matricula !== 'string' || !matricula.trim() ||
    typeof carrera !== 'string' || !carrera.trim()
  ) {
    return next(
      new ApiError(
        400,
        'VALIDATION_ERROR',
        'Todos los campos son obligatorios: nombre, email, matricula y carrera.',
        { messageKey: 'validation.attendee.fieldsRequired' }
      )
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email.trim())) {
    return next(
      new ApiError(
        400,
        'VALIDATION_ERROR',
        'El formato del correo electrónico no es válido.',
        { messageKey: 'validation.attendee.emailInvalid' }
      )
    );
  }

  next();
};

module.exports = validateAttendee;
