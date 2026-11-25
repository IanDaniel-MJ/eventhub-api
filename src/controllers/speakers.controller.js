
const speakersService = require('../services/speakers.service');

// Función existente de CRIS: consultar todos los ponentes
const getAllSpeakers = (req, res, next) => {
    try {
        const speakers = speakersService.getAllSpeakers();
        res.status(200).json(speakers);
    } catch (error) {
        next(error);
    }
};

// EVH-40: Controlador para consultar un ponente por ID
const getSpeakerById = (req, res, next) => {
    try {
        const { id } = req.params;
        const speaker = speakersService.getSpeakerById(id);
        return res.status(200).json(speaker);
    } catch (error) {
        return next(error);
    }
};

// EVH-20: Controlador para registrar un nuevo ponente
const createSpeaker = (req, res, next) => {
    try {

        // Obtener los datos enviados por Postman en el cuerpo JSON
        const speakerData = req.body;

        // Llamar al servicio de EVH-19 para crear el ponente
        const newSpeaker = speakersService.createSpeaker(speakerData);

        // Construir la dirección del recurso recién creado
        const location = `/api/v1/speakers/${newSpeaker.id}`;

        // Agregar la cabecera HTTP Location a la respuesta
        res.set('Location', location);

        // Devolver 201 Created junto con el ponente registrado
        return res.status(201).json(newSpeaker);

    } catch (error) {

        // Enviar cualquier error al middleware global errorHandler
        next(error);
    }
};

// ======================================================
// EVH-49: Controlador para reemplazar un ponente (PUT)
// ======================================================

const updateSpeaker = (req, res, next) => {
    try {

        // PASO 1: Obtener el ID enviado en la URL
        // Ejemplo: PUT /api/v1/speakers/abc-123
        const { id } = req.params;

        // PASO 2: Obtener los nuevos datos enviados en el Body
        const speakerData = req.body;

        // PASO 3: Llamar al servicio desarrollado en EVH-48
        // El servicio verifica que exista el ID y que el email sea único
        const updatedSpeaker = speakersService.updateSpeaker(
            id,
            speakerData
        );

        // PASO 4: Devolver HTTP 200 y el ponente actualizado
        // El identificador original debe conservarse
        return res.status(200).json(updatedSpeaker);

    } catch (error) {

        // Enviar los errores 404, 409 u otros al errorHandler
        return next(error);
    }
};

// EVH-53: Controlador para eliminar un ponente por ID
const deleteSpeaker = (req, res, next) => {
    try {
        const { id } = req.params;
        speakersService.deleteSpeaker(id);
        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
};

// Exportar los controladores para utilizarlos desde las rutas
module.exports = {
    getAllSpeakers,
    getSpeakerById,
    createSpeaker,
    updateSpeaker,
    deleteSpeaker
};
