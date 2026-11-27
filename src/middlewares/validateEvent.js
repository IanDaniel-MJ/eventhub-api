
const ApiError = require('../utils/ApiError');

// ============================================================
// FUNCION AUXILIAR: VALIDAR FECHAS ISO 8601
// ============================================================

// Comprueba que una fecha tenga formato ISO 8601 válido.
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


// ============================================================
// EVH-83: VALIDAR LA CREACION DE EVENTOS
// POST /api/v1/events
// ============================================================

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


// ============================================================
// EVH-84: VALIDAR LA ACTUALIZACION PARCIAL DE EVENTOS
// PATCH /api/v1/events/:id
// ============================================================

const validatePatchEvent = (req, res, next) => {

    const body = req.body;

    // 1. Rechazar un Body vacío o inválido.
    if (
        !body ||
        typeof body !== 'object' ||
        Array.isArray(body) ||
        Object.keys(body).length === 0
    ) {
        return next(
            new ApiError(
                400,
                'VALIDATION_ERROR',
                'Debes enviar al menos un campo válido para actualizar el evento.',
                { messageKey: 'validation.event.emptyPatch' }
            )
        );
    }


    // 2. Impedir modificar el estado mediante este PATCH.
    if (Object.prototype.hasOwnProperty.call(body, 'estado')) {
        return next(
            new ApiError(
                400,
                'VALIDATION_ERROR',
                'El estado del evento debe modificarse mediante la ruta de estados.',
                {
                    messageKey: 'validation.event.statusNotAllowedInPatch'
                }
            )
        );
    }


    // 3. Definir los campos que se pueden actualizar.
    const camposEditables = [
        'titulo',
        'descripcion',
        'tipo',
        'fecha',
        'sede',
        'cupo',
        'speakerId'
    ];


    // 4. No permitir campos desconocidos.
    const camposDesconocidos = Object.keys(body).filter(
        campo => !camposEditables.includes(campo)
    );

    if (camposDesconocidos.length > 0) {
        return next(
            new ApiError(
                400,
                'VALIDATION_ERROR',
                'La solicitud contiene campos que no se pueden modificar.',
                {
                    messageKey: 'validation.event.unknownFields'
                }
            )
        );
    }


    // 5. Comprobar que exista al menos un campo editable.
    const camposEnviados = camposEditables.filter(
        campo => Object.prototype.hasOwnProperty.call(body, campo)
    );

    if (camposEnviados.length === 0) {
        return next(
            new ApiError(
                400,
                'VALIDATION_ERROR',
                'Debes enviar al menos un campo válido para actualizar el evento.',
                { messageKey: 'validation.event.emptyPatch' }
            )
        );
    }


    // 6. Validar solo los campos de texto enviados.
    const camposTexto = [
        'titulo',
        'descripcion',
        'sede',
        'speakerId'
    ];

    for (const campo of camposTexto) {

        if (Object.prototype.hasOwnProperty.call(body, campo)) {

            if (
                typeof body[campo] !== 'string' ||
                !body[campo].trim()
            ) {
                return next(
                    new ApiError(
                        400,
                        'VALIDATION_ERROR',
                        'Los campos de texto enviados no pueden estar vacíos.',
                        {
                            messageKey: 'validation.event.emptyTextFields'
                        }
                    )
                );
            }
        }
    }


    // 7. Validar el tipo si fue enviado.
    if (Object.prototype.hasOwnProperty.call(body, 'tipo')) {

        const tiposPermitidos = [
            'conferencia',
            'taller',
            'seminario'
        ];

        if (!tiposPermitidos.includes(body.tipo)) {
            return next(
                new ApiError(
                    400,
                    'VALIDATION_ERROR',
                    'El tipo debe ser conferencia, taller o seminario.',
                    { messageKey: 'validation.event.invalidType' }
                )
            );
        }
    }


    // 8. Validar el cupo si fue enviado.
    if (Object.prototype.hasOwnProperty.call(body, 'cupo')) {

        if (!Number.isInteger(body.cupo) || body.cupo <= 0) {
            return next(
                new ApiError(
                    400,
                    'VALIDATION_ERROR',
                    'El cupo debe ser un número entero mayor a 0.',
                    { messageKey: 'validation.event.invalidCapacity' }
                )
            );
        }
    }


    // 9. Validar la fecha si fue enviada.
    if (Object.prototype.hasOwnProperty.call(body, 'fecha')) {

        // Comprobar formato ISO 8601.
        if (!esFechaISOValida(body.fecha)) {
            return next(
                new ApiError(
                    400,
                    'VALIDATION_ERROR',
                    'La fecha debe tener un formato ISO 8601 válido.',
                    { messageKey: 'validation.event.invalidDate' }
                )
            );
        }

        // Comprobar que sea futura.
        if (new Date(body.fecha).getTime() <= Date.now()) {
            return next(
                new ApiError(
                    400,
                    'VALIDATION_ERROR',
                    'La fecha del evento debe ser futura.',
                    { messageKey: 'validation.event.pastDate' }
                )
            );
        }
    }


    // 10. Todos los campos enviados son válidos.
    next();
};


// ============================================================
// EVH-84: VALIDAR EL CAMBIO DE ESTADO DE UN EVENTO
// PATCH /api/v1/events/:id/status
// ============================================================

const validateEventStatus = (req, res, next) => {

    const body = req.body;

    // 1. Definir los estados permitidos.
    const estadosPermitidos = [
        'borrador',
        'publicado',
        'cerrado',
        'cancelado'
    ];


    // 2. Validar que el Body contenga un estado válido.
    if (
        !body ||
        typeof body !== 'object' ||
        Array.isArray(body) ||
        !estadosPermitidos.includes(body.estado)
    ) {
        return next(
            new ApiError(
                400,
                'VALIDATION_ERROR',
                'El campo estado debe ser uno de: borrador, publicado, cerrado o cancelado.',
                { messageKey: 'validation.event.invalidStatus' }
            )
        );
    }


    // 3. No permitir campos adicionales en esta petición.
    const camposDesconocidos = Object.keys(body).filter(
        campo => campo !== 'estado'
    );

    if (camposDesconocidos.length > 0) {
        return next(
            new ApiError(
                400,
                'VALIDATION_ERROR',
                'La solicitud contiene campos que no se pueden modificar.',
                { messageKey: 'validation.event.unknownFields' }
            )
        );
    }


    // 4. El estado enviado es válido.
    next();
};


// ============================================================
// EXPORTACION DE LOS MIDDLEWARES
// ============================================================

// EVH-83: validateCreateEvent
// EVH-84: validatePatchEvent y validateEventStatus

module.exports = {
    validateCreateEvent,
    validatePatchEvent,
    validateEventStatus
};
