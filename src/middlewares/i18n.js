const { resolveLanguage, translate } = require('../utils/i18n');

// Resuelve el idioma por petición (?lang= o Accept-Language) y expone req.lang y req.t
const i18n = (req, res, next) => {
  const lang = resolveLanguage(req);

  req.lang = lang;
  req.t = (key, params = {}, fallback = null) => translate(lang, key, params, fallback);

  // Indica al cliente el idioma efectivo de la respuesta y avisa a cachés/proxies
  res.set('Content-Language', lang);
  res.vary('Accept-Language');

  next();
};

module.exports = i18n;