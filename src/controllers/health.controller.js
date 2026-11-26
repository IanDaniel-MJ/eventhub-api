const { version } = require('../../package.json');

const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: req.t('health.ok'),
    language: req.lang,
    uptime: Math.floor(process.uptime()),
    version
  });
};

module.exports = {
  getHealth
};