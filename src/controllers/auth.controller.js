const authService = require('../services/auth.service');

// Procesa la solicitud de registro de usuario y responde 201 Created
const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);

    return res.status(201).json({
      message: req.t('auth.registerSuccess'),
      data: user
    });
  } catch (error) {
    return next(error);
  }
};

// Procesa el inicio de sesión (Paso 1) y entrega el tempToken para verificar 2FA
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);

    return res.status(200).json({
      ...result,
      message: req.t('auth.loginSuccess')
    });
  } catch (error) {
    return next(error);
  }
};

// Procesa la verificación 2FA (Paso 2) y entrega el accessToken definitivo
const verify2FA = async (req, res, next) => {
  try {
    const result = await authService.verify2FA(req.body);

    return res.status(200).json({
      ...result,
      message: req.t('auth.verify2faSuccess')
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  verify2FA
};