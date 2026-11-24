
const express = require('express');

// Importar los controladores del módulo de ponentes
const speakersController = require('../controllers/speakers.controller');

// Importar el middleware de validación creado en EVH-18
const validateSpeaker = require('../middlewares/validateSpeaker');

// Crear el enrutador de Express
const router = express.Router();

// Ruta GET creada por CRIS para consultar todos los ponentes
router.get('/', speakersController.getAllSpeakers);

// EVH-40: Ruta GET para consultar un ponente por ID
router.get('/:id', speakersController.getSpeakerById);

// EVH-20: Ruta POST para registrar un nuevo ponente
// Primero valida los datos y después ejecuta el controlador
router.post('/', validateSpeaker, speakersController.createSpeaker);

// EVH-53: Eliminar un ponente por ID
router.delete('/:id', speakersController.deleteSpeaker);

// Exportar el enrutador para utilizarlo desde app.js
module.exports = router;
