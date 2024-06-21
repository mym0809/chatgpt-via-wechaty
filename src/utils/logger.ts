import { createLogger, format, transports } from 'winston';
import { getConfig } from '../config.ts';
import moment from 'moment-timezone';

const config = getConfig();
const logTimezone = config.logTimezone || 'Asia/Shanghai';

const customFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
  format: format.combine(
    format.timestamp({
      format: () => moment().tz(logTimezone).format('YYYY-MM-DD HH:mm:ss')
    }),
    format.colorize(),
    customFormat
  ),
  transports: [
    new transports.Console(),
    new transports.File({ filename: 'combined.log' })
  ]
});

export default logger;