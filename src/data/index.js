const fs = require('fs');
const path = require('path');

const seedPath = path.join(__dirname, 'seed.json');

const loadSeedData = () => {
  const rawData = fs.readFileSync(seedPath, 'utf-8');
  return JSON.parse(rawData);
};

// Copia limpia en memoria al iniciar el servidor
const initialData = loadSeedData();

const store = {
  speakers: [...initialData.speakers],
  events: [...initialData.events],
  attendees: [...initialData.attendees],
  registrations: [...initialData.registrations],
};

// --- Funciones CRUD para Speakers ---

const getAllSpeakers = () => {
  return [...store.speakers];
};

const getSpeakerById = (id) => {
  return store.speakers.find((speaker) => speaker.id === id) || null;
};

const getSpeakerByEmail = (email) => {
  return (
    store.speakers.find(
      (speaker) => speaker.email.toLowerCase() === email.toLowerCase()
    ) || null
  );
};

const createSpeaker = (speaker) => {
  store.speakers.push(speaker);
  return speaker;
};

const updateSpeaker = (id, updatedData) => {
  const index = store.speakers.findIndex((speaker) => speaker.id === id);
  if (index === -1) return null;

  store.speakers[index] = {
    ...store.speakers[index],
    ...updatedData,
    id,
  };
  return store.speakers[index];
};

const deleteSpeaker = (id) => {
  const index = store.speakers.findIndex((speaker) => speaker.id === id);
  if (index === -1) return false;

  store.speakers.splice(index, 1);
  return true;
};

// --- Consultas de Events (necesaria para validar eliminaciones) ---

const getEventsBySpeakerId = (speakerId) => {
  return store.events.filter((event) => event.speakerId === speakerId);
};

module.exports = {
  getAllSpeakers,
  getSpeakerById,
  getSpeakerByEmail,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker,
  getEventsBySpeakerId,
};