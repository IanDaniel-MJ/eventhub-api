const authService = require('../services/auth.service');

// Procesa la solicitud de registro de usuario y responde 201 Created
const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);

    return res.status(201).json({
      message: 'Usuario registrado exitosamente.',
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
    return res.status(200).json(result);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login
};