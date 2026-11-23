const data = require('../data');

const getAllSpeakers = () => {
  return data.getAllSpeakers();
};

module.exports = {
  getAllSpeakers,
};