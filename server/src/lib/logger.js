const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
            let line = `${timestamp} [${level}]: ${message}`;
            if (stack) line += `\n${stack}`;
            const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return line + extra;
          })
        ),
  ),
  transports: [new winston.transports.Console()],
});

module.exports = logger;
