import winston from 'winston';

const log = winston.createLogger({
  level: process.env.NODE_ENV !== 'debug' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    winston.format.colorize(),
    winston.format.printf(info => `[${info.timestamp}] [${info.level}] "${info.message}"`),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export default log;
