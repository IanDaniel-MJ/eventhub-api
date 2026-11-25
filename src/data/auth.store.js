// Almacena los usuarios registrados en memoria durante la ejecución del servidor
const users = [];

// Almacena los códigos OTP temporales indexados por userId: { code, expiresAt }
const twoFactorCodes = new Map();

// Busca un usuario por correo electrónico ignorando mayúsculas y espacios
const findUserByEmail = (email) => {
  const normalizedEmail = email.trim().toLowerCase();
  return users.find((user) => user.email === normalizedEmail) || null;
};

// Busca un usuario por su identificador único
const findUserById = (id) => {
  return users.find((user) => user.id === id) || null;
};

// Registra un nuevo usuario en memoria y devuelve el objeto almacenado
const createUser = (user) => {
  users.push(user);
  return user;
};

// Guarda o reemplaza el código 2FA activo de un usuario con su marca de expiración
const saveTwoFactorCode = (userId, code, expiresAt) => {
  twoFactorCodes.set(userId, { code, expiresAt });
};

// Obtiene el registro del código 2FA vigente para un usuario
const getTwoFactorCode = (userId) => {
  return twoFactorCodes.get(userId) || null;
};

// Elimina el código 2FA de memoria tras utilizarlo o expirar
const deleteTwoFactorCode = (userId) => {
  twoFactorCodes.delete(userId);
};

module.exports = {
  findUserByEmail,
  findUserById,
  createUser,
  saveTwoFactorCode,
  getTwoFactorCode,
  deleteTwoFactorCode
};