
const express = require('express');

// Importar los controladores del módulo de ponentes
const speakersController = require('../controllers/speakers.controller');

// Importar el middleware de validación creado en EVH-18
const validateSpeaker = require('../middlewares/validateSpeaker');

// Crear el enrutador de Express
const router = express.Router();


// ======================================================
// GET: CONSULTAR TODOS LOS PONENTES
// Ruta creada por CRIS
// ======================================================

router.get('/', speakersController.getAllSpeakers);


// ======================================================
// EVH-40: CONSULTAR UN PONENTE POR ID
// ======================================================

router.get('/:id', speakersController.getSpeakerById);


// ======================================================
// EVH-20: REGISTRAR UN NUEVO PONENTE (POST)
// ======================================================

// Primero valida los campos y después ejecuta el controlador
router.post('/', validateSpeaker, speakersController.createSpeaker);


// ======================================================
// EVH-49: REEMPLAZAR LOS DATOS DE UN PONENTE (PUT)
// ======================================================

// La ruta recibe el ID del ponente mediante el parámetro :id
// validateSpeaker comprueba los cuatro campos obligatorios
// y que el formato del correo electrónico sea válido
// Si la validación es correcta, ejecuta updateSpeaker
router.put('/:id', validateSpeaker, speakersController.updateSpeaker);


// ======================================================
// EVH-53: ELIMINAR UN PONENTE POR ID (DELETE)
// ======================================================

router.delete('/:id', speakersController.deleteSpeaker);


// ======================================================
// EXPORTAR EL ENRUTADOR
// ======================================================

// Permite utilizar las rutas del módulo desde app.js
module.exports = router;
