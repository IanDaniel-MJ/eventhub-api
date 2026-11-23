const speakersService = require('../services/speakers.service');

const getAllSpeakers = (req, res, next) => {
  try {
    const speakers = speakersService.getAllSpeakers();
    res.status(200).json(speakers);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSpeakers,
};