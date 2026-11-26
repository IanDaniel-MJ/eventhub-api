const es = require('../locales/es.json');
const en = require('../locales/en.json');

const SUPPORTED_LANGS = ['es', 'en'];
const DEFAULT_LANG = 'es';

const dictionaries = { es, en };

// Normaliza una etiqueta de idioma (ej. "en-US" -> "en") si está soportada
const normalizeLang = (rawLang) => {
  if (!rawLang || typeof rawLang !== 'string') return null;

  const base = rawLang.trim().toLowerCase().split(/[-_]/)[0];
  return SUPPORTED_LANGS.includes(base) ? base : null;
};

// Parsea la cabecera HTTP Accept-Language respetando prioridades (q=...)
const parseAcceptLanguage = (headerValue) => {
  if (!headerValue || typeof headerValue !== 'string') return null;

  const candidates = headerValue
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const qParam = params.find((p) => p.trim().startsWith('q='));
      const q = qParam ? parseFloat(qParam.trim().slice(2)) : 1.0;

      return {
        lang: normalizeLang(tag),
        q: Number.isNaN(q) ? 0 : q
      };
    })
    .filter((item) => item.lang && item.q > 0)
    .sort((a, b) => b.q - a.q);

  return candidates.length > 0 ? candidates[0].lang : null;
};

// Resuelve el idioma efectivo de la petición: ?lang= > Accept-Language > 'es'
const resolveLanguage = (req) => {
  const queryLang = normalizeLang(req?.query?.lang);
  if (queryLang) return queryLang;

  const headerLang = parseAcceptLanguage(req?.headers?.['accept-language']);
  if (headerLang) return headerLang;

  return DEFAULT_LANG;
};

// Obtiene una cadena anidada por ruta con puntos (ej. "errors.TOKEN_MISSING")
const getRawTranslation = (lang, key) => {
  if (!key || typeof key !== 'string') return null;

  const dict = dictionaries[lang] || dictionaries[DEFAULT_LANG];
  const segments = key.split('.');
  let current = dict;

  for (const segment of segments) {
    if (current && Object.prototype.hasOwnProperty.call(current, segment)) {
      current = current[segment];
    } else {
      return null;
    }
  }

  return typeof current === 'string' ? current : null;
};

// Reemplaza marcadores {{param}} dentro de la cadena traducida
const interpolate = (template, params = {}) => {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(params, key)
      ? String(params[key])
      : match;
  });
};

const hasTranslation = (lang, key) => {
  return getRawTranslation(lang, key) !== null;
};

const translate = (lang, key, params = {}, fallback = null) => {
  const resolvedLang = SUPPORTED_LANGS.includes(lang) ? lang : DEFAULT_LANG;
  const template =
    getRawTranslation(resolvedLang, key) ??
    getRawTranslation(DEFAULT_LANG, key);

  if (!template) {
    return fallback ?? key;
  }

  return interpolate(template, params);
};

module.exports = {
  SUPPORTED_LANGS,
  DEFAULT_LANG,
  resolveLanguage,
  hasTranslation,
  translate
};