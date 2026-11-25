
const data = require('../data');

// Importar la utilidad para generar identificadores UUID
const { generateId } = require('../utils/idGenerator');

// Importar la clase de errores personalizada
const ApiError = require('../utils/ApiError');


// ======================================================
// GET: CONSULTAR TODOS LOS PONENTES
// Función existente de CRIS
// ======================================================

const getAllSpeakers = () => {

    // Obtener todos los ponentes de la capa de datos
    return data.getAllSpeakers();
};


// ======================================================
// EVH-39: CONSULTAR UN PONENTE POR ID
// ======================================================

const getSpeakerById = (id) => {

    // Buscar al ponente por su identificador
    const speaker = data.getSpeakerById(id);

    // Si no existe, devolver error 404
    if (!speaker) {
        throw new ApiError(
            404,
            'SPEAKER_NOT_FOUND',
            'Ponente no encontrado'
        );
    }

    // Devolver el ponente encontrado
    return speaker;
};


// ======================================================
// EVH-19: REGISTRAR UN NUEVO PONENTE (POST)
// Esta función pertenece a tu Story anterior EVH-11
// ======================================================

const createSpeaker = (speakerData) => {

    // Obtener los datos enviados desde el controlador
    const { nombre, email, institucion, especialidad } = speakerData;

    // Eliminar espacios al inicio y al final del correo
    const normalizedEmail = email.trim();

    // Buscar si ya existe un ponente con el mismo correo
    // La comparación ignora mayúsculas y minúsculas
    const existingSpeaker = data.getSpeakerByEmail(normalizedEmail);

    // Si el correo ya existe, generar error 409
    if (existingSpeaker) {
        throw new ApiError(
            409,
            'DUPLICATE_EMAIL',
            'El correo electrónico ya está registrado'
        );
    }

    // Crear un nuevo ponente con identificador UUID
    const newSpeaker = {
        id: generateId(),
        nombre: nombre.trim(),
        email: normalizedEmail,
        institucion: institucion.trim(),
        especialidad: especialidad.trim()
    };

    // Guardar el ponente en memoria utilizando la capa de datos
    return data.createSpeaker(newSpeaker);
};


// ======================================================
// EVH-48: REEMPLAZAR UN PONENTE EXISTENTE (PUT)
// Nueva función de tu Story EVH-47
// ======================================================

const updateSpeaker = (id, speakerData) => {

    // PASO 1: Verificar que exista un ponente con ese ID
    const existingSpeaker = data.getSpeakerById(id);

    // Si no existe, generar error 404 Not Found
    if (!existingSpeaker) {
        throw new ApiError(
            404,
            'SPEAKER_NOT_FOUND',
            'Ponente no encontrado'
        );
    }

    // PASO 2: Obtener los datos nuevos del ponente
    // El middleware validateSpeaker comprueba sus campos
    const { nombre, email, institucion, especialidad } = speakerData;

    // Eliminar espacios al inicio y al final del correo
    const normalizedEmail = email.trim();

    // PASO 3: Buscar si el correo pertenece a otro ponente
    // La búsqueda ignora diferencias entre mayúsculas y minúsculas
    const speakerWithEmail = data.getSpeakerByEmail(normalizedEmail);

    // Si el correo existe y pertenece a un ID diferente,
    // no permitir que se utilice para actualizar este ponente
    if (speakerWithEmail && speakerWithEmail.id !== id) {
        throw new ApiError(
            409,
            'DUPLICATE_EMAIL',
            'El correo electrónico ya está registrado'
        );
    }

    // PASO 4: Preparar los datos que reemplazarán
    // la información anterior del ponente
    const updatedData = {
        nombre: nombre.trim(),
        email: normalizedEmail,
        institucion: institucion.trim(),
        especialidad: especialidad.trim()
    };

    // PASO 5: Guardar los datos actualizados
    // data.updateSpeaker conserva el identificador original
    return data.updateSpeaker(id, updatedData);
};


// ======================================================
// EVH-51: ELIMINAR UN PONENTE (DELETE)
// Función existente de ISAAC
// ======================================================

const deleteSpeaker = (id) => {

    // Validación 1: Verificar que el ponente exista
    const speaker = data.getSpeakerById(id);

    // Si no existe, generar error 404
    if (!speaker) {
        throw new ApiError(
            404,
            'SPEAKER_NOT_FOUND',
            'Ponente no encontrado'
        );
    }

    // Validación 2: Verificar si el ponente tiene eventos asociados
    const speakerEvents = data.getEventsBySpeakerId(id);

    // No permitir eliminar un ponente con eventos relacionados
    if (speakerEvents && speakerEvents.length > 0) {
        throw new ApiError(
            409,
            'SPEAKER_HAS_EVENTS',
            'No se puede eliminar el ponente porque tiene eventos asociados'
        );
    }

    // Eliminar el ponente de la capa de datos en memoria
    data.deleteSpeaker(id);
};


// ======================================================
// EXPORTAR TODAS LAS FUNCIONES
// ======================================================

module.exports = {
    getAllSpeakers,
    getSpeakerById,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker
};
