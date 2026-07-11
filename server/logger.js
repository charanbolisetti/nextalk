const pino = require('pino');
const config = require('./config');

const transport = config.isProduction
  ? undefined
  : pino.transport({
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      },
    });

const logger = pino(
  {
    level: config.isProduction ? 'info' : 'debug',
  },
  transport
);

module.exports = logger;
