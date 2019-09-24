import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.NODE_ENV !== 'debug' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.colorize(),
    winston.format.printf(info => `[${info.timestamp}] [${info.level}] ${info.message}`),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export default logger;
