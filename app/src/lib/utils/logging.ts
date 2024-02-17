import { browser, dev } from '$app/environment';
import { logLevel, logLevelClient } from '$lib/configs.js';


const argDateFormater = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
function currentArgDateFormatted() {
    return argDateFormater.format(Date.now());
}

function logNoop() { }

function logDev(...args: any[]) {
    console['log'](`[DEV] ${currentArgDateFormatted()}`, ...args);
}

function logDebug(...args: any[]) {
    console['debug'](`[DEBUG] ${currentArgDateFormatted()}`, ...args);
}

function logInfo(...args: any[]) {
    console['info'](`[INFO] ${currentArgDateFormatted()}`, ...args);
}

function logWarn(...args: any[]) {
    console['warn'](`[WARN] ${currentArgDateFormatted()}`, ...args);
}

function logError(...args: any[]) {
    console['error'](`[ERROR] ${currentArgDateFormatted()}`, ...args);
}

function logFatal(...args: any[]) {
    console['error'](`[FATAL] ${currentArgDateFormatted()}`, ...args);
}

const noLogger = {
    dev: logNoop,
    debug: logNoop,
    info: logNoop,
    warn: logNoop,
    error: logNoop,
    fatal: logNoop,
} as const;

function createLogger(enabled: boolean, level: number) {
    if (!enabled) {
        return noLogger;
    }

    return {
        dev: dev ? logDev : logNoop,
        debug: dev || level >= 4 ? logDebug : logNoop,
        info: dev || level >= 3 ? logInfo : logNoop,
        warn: dev || level >= 2 ? logWarn : logNoop,
        error: level >= 1 ? logError : logNoop,
        fatal: logFatal,
    } as const;
}

/**
 * Server side only logger
 * 
 * Log levels:
 * - _: fatal
 * - 1: error
 * - 2: warn
 * - 3: info
 * - 4: debug
 * 
 * Dev logs are always shown in development mode
 */
export const log = createLogger(!browser, logLevel);

/**
 * Client side only logger
 * 
 * Log levels:
 * - _: fatal
 * - 1: error
 * - 2: warn
 * - 3: info
 * - 4: debug
 * 
 * Dev logs are always shown in development mode
 */
export const logClient = createLogger(browser, logLevelClient);
