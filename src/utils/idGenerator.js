const crypto = require('crypto');

// Genera un identificador único universal (UUID v4) usando el módulo nativo crypto
const generateId = () => {
  return crypto.randomUUID();
};

module.exports = { generateId };