import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
const configs = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_DIR: process.env.LOG_DIR || './logs',
  ENV: process.env.NODE_ENV || 'development',
  CENTRALIZE_LOG_DATE_PATTERN: process.env.CENTRALIZE_LOG_DATE_PATTERN || 'YYYY-MM-DD',
  CENTRALIZE_LOG_ZIPPED_ARCHIVE: process.env.CENTRALIZE_LOG_ZIPPED_ARCHIVE === 'true',
  CENTRALIZE_LOG_MAX_SIZE: process.env.CENTRALIZE_LOG_MAX_SIZE || '20m',
  CENTRALIZE_LOG_MAX_FILES: process.env.CENTRALIZE_LOG_MAX_FILES || '14d',
  LOKI_ENABLE: process.env.LOKI_ENABLE === 'true',
  LOKI_LOG_DIR: process.env.LOKI_LOG_DIR || '/var/log/loki',
};
enum LogLevel {
  Error = 'error',
  Warn = 'warn',
  Info = 'info',
  Debug = 'debug',
}

const { combine, timestamp, printf, splat, json, colorize } = winston.format;

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
const DEFAULT_LOKI_LOG_DIR = '/app/log/services/bo-xidach-livestream-cas';

const consoleFormat = printf(({ level, message, timestamp, service }: any) => {
  const serviceTag = service ? `[${service}]` : '';
  return `${timestamp} ${serviceTag} ${level}: ${message}`;
});

function createWinstonLogger(serviceName: string = 'bo-xidach-livestream-cas'): winston.Logger {
  const LOG_LEVEL = configs.LOKI_ENABLE ? LogLevel.Info : configs.LOG_LEVEL;
  const transports: any[] = [
    new winston.transports.Console({
      level: LOG_LEVEL,
      format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), colorize({ all: true }), splat(), consoleFormat),
    }),
  ];

  const LOG_DIR = configs.LOKI_ENABLE ? DEFAULT_LOKI_LOG_DIR : configs.LOKI_LOG_DIR;
  if (LOG_DIR) {
    const logFileName = serviceName ? `${LOG_DIR}/${serviceName}-%DATE%.log` : `${LOG_DIR}/application-%DATE%.log`;

    const fileRotateTransport = new DailyRotateFile({
      filename: logFileName,
      datePattern: configs.CENTRALIZE_LOG_DATE_PATTERN,
      zippedArchive: configs.CENTRALIZE_LOG_ZIPPED_ARCHIVE,
      maxSize: configs.CENTRALIZE_LOG_MAX_SIZE,
      maxFiles: configs.CENTRALIZE_LOG_MAX_FILES,
      level: configs.LOG_LEVEL,
      format: combine(timestamp(), splat(), json()),
    });

    transports.push(fileRotateTransport);
  }

  const winstonOptions: winston.LoggerOptions = {
    level: configs.LOG_LEVEL,
    defaultMeta: { service: serviceName || 'unknown-service', env: configs.ENV },
    transports,
  };

  return winston.createLogger(winstonOptions);
}

interface LoggerState {
  serviceName: string | null;
  instance: winston.Logger;
}

const state: LoggerState = {
  serviceName: null,
  instance: createWinstonLogger('bo-xidach-livestream-cas'),
};

const logger = {
  setServiceName(serviceName: string) {
    state.serviceName = serviceName;
    state.instance = createWinstonLogger(serviceName);
  },

  logError: (message: string, ...meta: any[]) => {
    state.instance.error(message, ...meta);
  },

  logInfo: (message: string, ...meta: any[]) => {
    state.instance.info(message, ...meta);
  },

  logInfoColor: (color: COLOR_LOG, ...message: [any, ...any[]]) => {
    const [messageFormat, ...meta] = message;
    state.instance.info(`${color}${messageFormat}${COLOR_LOG.RESET}`, ...meta);
  },

  logDebug: (message: string, ...meta: any[]) => {
    state.instance.debug(message, ...meta);
  },

  logWarn: (message: string, ...meta: any[]) => {
    state.instance.warn(message, ...meta);
  },

  getInstance: () => state.instance,
};

export default logger;
