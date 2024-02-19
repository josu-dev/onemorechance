import { createLogger, numberFromEnv } from '../src/shared/utils.js';


const DEFAULT_LOG_LEVEL = 3;

const logLevel = numberFromEnv(process.env.LOG_LEVEL_WS, DEFAULT_LOG_LEVEL);

/**
 * WebSocketServer side only logger
 */
export const log = createLogger(logLevel, process.env.NODE_ENV !== 'production');
