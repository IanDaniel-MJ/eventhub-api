const ApiError = require('../utils/ApiError');
const { DEFAULT_LANG, hasTranslation, translate } = require('../utils/i18n');

// Centraliza y estandariza todas las respuestas de error de la API con soporte ES/EN
const errorHandler = (err, req, res, next) => {
  const lang = req.lang || DEFAULT_LANG;

  let status = 500;
  let code = 'INTERNAL_SERVER_ERROR';
  let message = translate(lang, 'errors.INTERNAL_SERVER_ERROR');

  // Evalúa si es un error controlado de negocio o de validación
  if (err instanceof ApiError) {
    status = err.status;
    code = err.code;

    const codeKey = `errors.${code}`;

    if (err.messageKey && hasTranslation(lang, err.messageKey)) {
      message = translate(lang, err.messageKey, err.params);
    } else if (code !== 'VALIDATION_ERROR' && hasTranslation(lang, codeKey)) {
      message = translate(lang, codeKey, err.params);
    } else if (lang !== DEFAULT_LANG && hasTranslation(lang, codeKey)) {
      // Si falta messageKey en una validación en otro idioma, evita responder en español
      message = translate(lang, codeKey, err.params);
    } else {
      message = err.message;
    }
  } else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Detecta errores de sintaxis cuando el cliente envía un JSON mal formado
    status = 400;
    code = 'VALIDATION_ERROR';
    message = translate(lang, 'errors.INVALID_JSON');
  } else {
    // Registra el detalle completo en consola para depuración interna sin exponerlo al cliente
    console.error('[ERROR NO CONTROLADO]:', err);
  }

  // Asegura la cabecera Content-Language incluso ante errores tempranos
  res.set('Content-Language', lang);

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