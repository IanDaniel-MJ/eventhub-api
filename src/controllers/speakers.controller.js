
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

// Exportar los controladores para utilizarlos desde las rutas
module.exports = {
    getAllSpeakers,
    createSpeaker
};
