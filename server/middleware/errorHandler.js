const logger = require('../logger');

module.exports = (err, req, res, next) => {
  logger.error({ err, method: req.method, url: req.originalUrl }, err.message);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal server error',
  });
};
