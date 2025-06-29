import winston from 'winston';
import moment from 'moment-timezone';
import env from './config';

const { combine, timestamp, printf, splat } = winston.format;

const LOG_LEVEL_SCORE = {
  error: 0,
  info: 1,
  debug: 2,
};

export enum COLOR_LOG {
  RESET = '\x1b[0m',

  // text color
  BLACK = '\x1b[30m',
  RED = '\x1b[31m',
  GREEN = '\x1b[32m',
  YELLOW = '\x1b[33m',
  BLUE = '\x1b[34m',
  MAGENTA = '\x1b[35m',
  CYAN = '\x1b[36m',
  WHITE = '\x1b[37m',

  // background color

  BG_BLACK = '\x1b[40m',
  BG_RED = '\x1b[41m',
  BG_GREEN = '\x1b[42m',
  BG_YELLOW = '\x1b[43m',
  BG_BLUE = '\x1b[44m',
  BG_MAGENTA = '\x1b[45m',
  BG_CYAN = '\x1b[46m',
  BG_WHITE = '\x1b[47m',
}

const myFormat = printf(({ level, message, timestamp }) => {
  // @ts-ignore
  const time = moment(timestamp).tz('Asia/Ho_Chi_Minh').format('YYYY-MM-DD_HH:mm:ss.SSS');
  return `[${level}] ${time}: ${message}`;
});

const loggerInstance = winston.createLogger({
  level: env.LOG_LEVEL,
  format: combine(splat(), timestamp(), myFormat),
  transports: [new winston.transports.Console({ level: env.LOG_LEVEL })],
});

const logger = {
  logError: (message: string, ...customArgs: any[]): void => {
    if (logger.canLog('error'))
      loggerInstance.error(`${COLOR_LOG.RED}${message}${COLOR_LOG.RESET}`, ...customArgs);
  },

  logInfo: (message: string, ...customArgs: any[]): void => {
    if (logger.canLog('info')) loggerInstance.info(message, ...customArgs);
  },
  logDebug: (message: string, ...customArgs: any[]): void => {
    if (logger.canLog('debug')) loggerInstance.debug(message, ...customArgs);
  },

  logInfoColor: (color: COLOR_LOG, ...message: [any, ...any[]]) => {
    if (logger.canLog('info')) {
      const [messageFormat, ...meta] = message;
      loggerInstance.info(`${color}${messageFormat}${COLOR_LOG.RESET}`, ...meta);
    }
  },
  logColor: (color: COLOR_LOG, ...message: [any, ...any[]]) => {
    const [messageFormat, ...meta] = message;
    console.log(`${color}${messageFormat}${COLOR_LOG.RESET}`, ...meta);
  },

  canLog: (mode: string): boolean => {
    // @ts-ignore
    return LOG_LEVEL_SCORE[loggerInstance.level] >= LOG_LEVEL_SCORE[mode];
  },
};

export default logger;
