require('dotenv').config();
const app = require('./src/app');
const logger = require('./src/lib/logger');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  logger.info(`OsusuApp API running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    clientUrl: process.env.CLIENT_URL,
  });
});

// Graceful shutdown — required for Render's deploy cycle
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed.');
    process.exit(0);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { message: err.message, stack: err.stack });
  server.close(() => process.exit(1));
});
