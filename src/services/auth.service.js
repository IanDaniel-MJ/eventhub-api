const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { generateId } = require('../utils/idGenerator');
const authStore = require('../data/auth.store');

const SALT_ROUNDS = 10;
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutos

// Obtiene la clave secreta para firmar y verificar JWT desde variables de entorno
const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'eventhub_dev_secret_key';
};

// Obtiene el tiempo de expiración del accessToken desde variables de entorno
const getJwtExpiresIn = () => {
  return process.env.JWT_EXPIRES_IN || '1h';
};

// Registra un nuevo usuario validando correo único y hasheando su contraseña
const register = async ({ nombre, email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = authStore.findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new ApiError(
      409,
      'USER_ALREADY_EXISTS',
      'Ya existe una cuenta registrada con ese correo electrónico.',
      { messageKey: 'errors.USER_ALREADY_EXISTS' }
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
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.', {
      messageKey: 'errors.INVALID_CREDENTIALS'
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Correo o contraseña incorrectos.', {
      messageKey: 'errors.INVALID_CREDENTIALS'
    });
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

// Valida el token temporal y el código OTP de un solo uso para emitir el accessToken definitivo
const verify2FA = async ({ tempToken, code }) => {
  let payload;
  try {
    payload = jwt.verify(tempToken, getJwtSecret());
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(
        401,
        'TOKEN_EXPIRED',
        'El token temporal ha expirado. Inicia sesión nuevamente.',
        { messageKey: 'errors.TEMP_TOKEN_EXPIRED' }
      );
    }

    throw new ApiError(401, 'TOKEN_INVALID', 'El token temporal no es válido.', {
      messageKey: 'errors.TEMP_TOKEN_INVALID'
    });
  }

  // Confirma que el token corresponda al paso pendiente de 2FA
  if (payload.type !== '2fa_pending' || !payload.sub) {
    throw new ApiError(
      401,
      'TOKEN_INVALID',
      'El token proporcionado no corresponde a un inicio de sesión pendiente de 2FA.',
      { messageKey: 'errors.TOKEN_NOT_2FA_PENDING' }
    );
  }

  const user = authStore.findUserById(payload.sub);

  if (!user) {
    throw new ApiError(401, 'TOKEN_INVALID', 'El usuario asociado al token no existe.', {
      messageKey: 'errors.TOKEN_USER_NOT_FOUND'
    });
  }

  const storedOtp = authStore.getTwoFactorCode(user.id);

  // Rechaza si no existe código activo o si ya fue consumido anteriormente
  if (!storedOtp) {
    throw new ApiError(
      401,
      'INVALID_2FA_CODE',
      'El código 2FA es inválido o ya fue utilizado.',
      { messageKey: 'errors.INVALID_2FA_CODE_OR_USED' }
    );
  }

  // Evalúa si el código excedió su tiempo de vida de 5 minutos
  if (Date.now() > storedOtp.expiresAt) {
    authStore.deleteTwoFactorCode(user.id);
    throw new ApiError(
      401,
      'EXPIRED_2FA_CODE',
      'El código 2FA ha expirado. Inicia sesión nuevamente para generar uno nuevo.',
      { messageKey: 'errors.EXPIRED_2FA_CODE' }
    );
  }

  // Compara el código ingresado contra el almacenado en memoria
  if (storedOtp.code !== code) {
    throw new ApiError(401, 'INVALID_2FA_CODE', 'El código 2FA es incorrecto.', {
      messageKey: 'errors.INVALID_2FA_CODE'
    });
  }

  // Elimina el código de memoria de inmediato para garantizar un solo uso
  authStore.deleteTwoFactorCode(user.id);

  const expiresIn = getJwtExpiresIn();
  const accessToken = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      rol: user.rol,
      type: 'access'
    },
    getJwtSecret(),
    { expiresIn }
  );

  return {
    message: 'Autenticación en dos pasos completada exitosamente.',
    accessToken,
    tokenType: 'Bearer',
    expiresIn,
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    }
  };
};

module.exports = {
  register,
  login,
  verify2FA
};