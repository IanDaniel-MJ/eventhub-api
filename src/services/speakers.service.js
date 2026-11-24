
const data = require('../data');

// Importar la utilidad para generar identificadores UUID
const { generateId } = require('../utils/idGenerator');

// Importar la clase de errores personalizada
const ApiError = require('../utils/ApiError');

// Función existente de CRIS: consultar todos los ponentes
const getAllSpeakers = () => {
    return data.getAllSpeakers();
};

// EVH-19: Servicio encargado de registrar un nuevo ponente
const createSpeaker = (speakerData) => {

    // Obtener los datos del ponente recibidos desde el controlador
    const { nombre, email, institucion, especialidad } = speakerData;

    // Eliminar espacios al inicio y al final del correo
    const normalizedEmail = email.trim();

    // Buscar si el correo electrónico ya existe en memoria.
    // La función de CRIS compara ignorando mayúsculas y minúsculas.
    const existingSpeaker = data.getSpeakerByEmail(normalizedEmail);

    // Si ya existe un ponente con ese correo, generar un error 409
    if (existingSpeaker) {
        throw new ApiError(
            409,
            'DUPLICATE_EMAIL',
            'El correo electrónico ya está registrado'
        );
    }

    // Crear el objeto del nuevo ponente con un ID único
    const newSpeaker = {
        id: generateId(),
        nombre: nombre.trim(),
        email: normalizedEmail,
        institucion: institucion.trim(),
        especialidad: especialidad.trim()
    };

    // Guardar el nuevo ponente utilizando la capa de datos de CRIS
    return data.createSpeaker(newSpeaker);
};

// Exportar las funciones para utilizarlas desde los controladores
module.exports = {
    getAllSpeakers,
    createSpeaker
};
