
const ApiError = require('../utils/ApiError');

// EVH-83: Middleware para validar la creación de eventos.

// Comprueba que la fecha tenga formato ISO 8601 válido.
const esFechaISOValida = (fecha) => {
    if (typeof fecha !== 'string') {
        return false;
    }

    // Requiere fecha, hora y zona horaria.
    const isoRegex =
        /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d):([0-5]\d)(?:\.\d{1,3})?(Z|[+-]\d{2}:\d{2})$/;

    const coincidencia = fecha.match(isoRegex);

    if (!coincidencia) {
        return false;
    }

    const anio = Number(coincidencia[1]);
    const mes = Number(coincidencia[2]);
    const dia = Number(coincidencia[3]);

    if (mes < 1 || mes > 12) {
        return false;
    }

    // Evita fechas inexistentes, como 30 de febrero.
    const diasDelMes = new Date(
        Date.UTC(anio, mes, 0)
    ).getUTCDate();

    if (dia < 1 || dia > diasDelMes) {
        return false;
    }

    const fechaConvertida = new Date(fecha);

    return !Number.isNaN(fechaConvertida.getTime());
};


// Validación para POST /api/v1/events
const validateCreateEvent = (req, res, next) => {

    // Obtener los datos enviados en el Body.
    const {
        titulo,
        descripcion,
        tipo,
        fecha,
        sede,
        cupo,
        speakerId
    } = req.body || {};


    // 1. Comprobar que existan todos los campos.
    if (
        typeof titulo !== 'string' || !titulo.trim() ||
        typeof descripcion !== 'string' || !descripcion.trim() ||
        typeof tipo !== 'string' || !tipo.trim() ||
        typeof fecha !== 'string' || !fecha.trim() ||
        typeof sede !== 'string' || !sede.trim() ||
        cupo === undefined || cupo === null ||
        typeof speakerId !== 'string' || !speakerId.trim()
    ) {
        return next(
            new ApiError(
                400,
                'VALIDATION_ERROR',
                'Todos los campos son obligatorios: titulo, descripcion, tipo, fecha, sede, cupo y speakerId.',
                { messageKey: 'validation.event.fieldsRequired' }
            )
        );
    }


    // 2. Validar los tipos de evento permitidos.
    const tiposPermitidos = [
        'conferencia',
        'taller',
        'seminario'
    ];

    if (!tiposPermitidos.includes(tipo)) {
        return next(
            new ApiError(
                400,
                'VALIDATION_ERROR',
                'El tipo debe ser conferencia, taller o seminario.',
                { messageKey: 'validation.event.invalidType' }
            )
        );
    }


    // 3. Validar que el cupo sea entero positivo.
    if (!Number.isInteger(cupo) || cupo <= 0) {
        return next(
            new ApiError(
                400,
                'VALIDATION_ERROR',
                'El cupo debe ser un número entero mayor a 0.',
                { messageKey: 'validation.event.invalidCapacity' }
            )
        );
    }


    // 4. Validar el formato ISO 8601.
    if (!esFechaISOValida(fecha)) {
        return next(
            new ApiError(
                400,
                'VALIDATION_ERROR',
                'La fecha debe tener un formato ISO 8601 válido.',
                { messageKey: 'validation.event.invalidDate' }
            )
        );
    }


    // 5. Comprobar que la fecha sea futura.
    if (new Date(fecha).getTime() <= Date.now()) {
        return next(
            new ApiError(
                400,
                'VALIDATION_ERROR',
                'La fecha del evento debe ser futura.',
                { messageKey: 'validation.event.pastDate' }
            )
        );
    }


    // 6. Todos los datos son válidos.
    next();
};


// Exportar el middleware.
// En EVH-84 agregaremos las otras funciones.
module.exports = {
    validateCreateEvent
};
