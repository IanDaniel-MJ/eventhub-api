const express = require('express');
const speakersController = require('../controllers/speakers.controller');

const router = express.Router();

router.get('/', speakersController.getAllSpeakers);

module.exports = router;