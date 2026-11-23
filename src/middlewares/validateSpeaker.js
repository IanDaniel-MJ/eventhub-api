
const ApiError = require('../utils/ApiError');

// Middleware encargado de validar los datos de un ponente
// antes de permitir su registro o actualización.
const validateSpeaker = (req, res, next) => {

    // Obtener los datos enviados por el cliente en el cuerpo
    // de la petición HTTP, que debe estar en formato JSON.
    const { nombre, email, institucion, especialidad } = req.body || {};

    // Validar que los cuatro campos obligatorios sean cadenas
    // de texto y que no estén vacíos o contengan solo espacios.
    if (
        typeof nombre !== 'string' || !nombre.trim() ||
        typeof email !== 'string' || !email.trim() ||
        typeof institucion !== 'string' || !institucion.trim() ||
        typeof especialidad !== 'string' || !especialidad.trim()
    ) {

        // Generar un error 400 cuando falta algún campo
        // obligatorio o su contenido no es válido.
        return next(new ApiError(
            400,
            'VALIDATION_ERROR',
            'Todos los campos son obligatorios: nombre, email, institucion y especialidad'
        ));
    }

    // Expresión regular para comprobar el formato básico
    // de una dirección de correo electrónico.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validar que el correo cumpla con el formato esperado.
    if (!emailRegex.test(email.trim())) {

        // Generar un error 400 si el correo es inválido.
        return next(new ApiError(
            400,
            'VALIDATION_ERROR',
            'El formato del correo electrónico no es válido'
        ));
    }

    // Si todos los datos son correctos, continuar con
    // el siguiente middleware o controlador de Express.
    next();
};

// Exportar el middleware para utilizarlo en las rutas
// POST y PUT del módulo de ponentes.
module.exports = validateSpeaker;
