const express = require('express');
const authController = require('../controllers/auth.controller');
const { authLimiter } = require('../middlewares/rateLimiter');
const {
  validateRegister,
  validateLogin,
  validateVerify2FA
} = require('../middlewares/validateAuth');

const router = express.Router();

// Aplica el límite estricto por minuto a todas las rutas de autenticación
router.use(authLimiter);

// Registra un nuevo usuario en el sistema
router.post('/register', validateRegister, authController.register);

// Valida credenciales y genera el token temporal junto con el código 2FA
router.post('/login', validateLogin, authController.login);

// Verifica el código 2FA y emite el token JWT de acceso definitivo
router.post('/verify-2fa', validateVerify2FA, authController.verify2FA);

module.exports = router;