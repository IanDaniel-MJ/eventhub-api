const { version } = require('../../package.json');

const getHealth = (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: Math.floor(process.uptime()),
    version
  });
};

module.exports = {
  getHealth
};