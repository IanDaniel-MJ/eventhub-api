const ApiError = require('../utils/ApiError');

// Middleware encargado de validar los datos de un ponente
// antes de permitir su registro o actualización.
const validateSpeaker = (req, res, next) => {
  const { nombre, email, institucion, especialidad } = req.body || {};

  if (
    typeof nombre !== 'string' || !nombre.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof institucion !== 'string' || !institucion.trim() ||
    typeof especialidad !== 'string' || !especialidad.trim()
  ) {
    return next(
      new ApiError(
        400,
        'VALIDATION_ERROR',
        'Todos los campos son obligatorios: nombre, email, institucion y especialidad.',
        { messageKey: 'validation.speaker.fieldsRequired' }
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
        { messageKey: 'validation.speaker.emailInvalid' }
      )
    );
  }

  next();
};

module.exports = validateSpeaker;