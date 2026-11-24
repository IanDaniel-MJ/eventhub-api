const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { generateId } = require('../utils/idGenerator');
const authStore = require('../data/auth.store');

const SALT_ROUNDS = 10;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutos

// Obtiene la clave secreta para firmar JWT desde variables de entorno
const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'eventhub_dev_secret_key';
};

// Registra un nuevo usuario validando correo único y hasheando su contraseña
const register = async ({ nombre, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = authStore.findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new ApiError(
      409,
      'USER_ALREADY_EXISTS',
      'Ya existe una cuenta registrada con ese correo electrónico.'
    );
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const newUser = {
    id: generateId(),
    nombre: nombre.trim(),
    email: normalizedEmail,
    rol: 'usuario',
    passwordHash,
    fechaCreacion: new Date().toISOString()
  };

  authStore.createUser(newUser);

  // Devuelve los datos públicos del usuario omitiendo el hash de contraseña
  return {
    id: newUser.id,
    nombre: newUser.nombre,
    email: newUser.email,
    rol: newUser.rol,
    fechaCreacion: newUser.fechaCreacion
  };
};

// Valida credenciales, genera un código 2FA temporal y emite un tempToken de 5 minutos
const login = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = authStore.findUserByEmail(normalizedEmail);

  if (!user) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.');
  }

  // Genera código numérico de 6 dígitos (100000 a 999999) y calcula su expiración
  const otpCode = String(crypto.randomInt(100000, 1000000));
  const expiresAt = Date.now() + OTP_TTL_MS;

  authStore.saveTwoFactorCode(user.id, otpCode, expiresAt);

  // Muestra el código en la consola del servidor simulando el envío por correo/SMS
  console.log(`[2FA] Código de verificación para ${user.email}: ${otpCode} (expira en 5 min)`);

  // Firma token temporal restringido exclusivamente al flujo pendiente de 2FA
  const tempToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      type: '2fa_pending'
    },
    getJwtSecret(),
    { expiresIn: '5m' }
  );

  const responseData = {
    message: 'Credenciales válidas. Verifica el código 2FA para obtener tu token de acceso.',
    tempToken,
    expiresIn: '5m'
  };

  // Incluye el código en la respuesta únicamente en entorno de desarrollo para pruebas automatizadas
  if (process.env.NODE_ENV === 'development') {
    responseData.devCode = otpCode;
  }

  return responseData;
};

module.exports = {
  register,
  login
};