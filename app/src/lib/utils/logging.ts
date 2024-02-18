import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { LOG_LEVEL_CLIENT } from '$lib/defaults.ts';


const logLevel = (() => {
    if (!env.PUBLIC_LOG_LEVEL_SK_CLIENT) {
        return LOG_LEVEL_CLIENT;
    }
    const value = parseInt(env.PUBLIC_LOG_LEVEL_SK_CLIENT);
    if (isNaN(value)) {
        return LOG_LEVEL_CLIENT;
    }
    return value;
})();

const argDateFormater = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
function currentArgDateFormatted() {
    return argDateFormater.format(Date.now());
}

function logNoop() { }

function logDev(...args: any[]) {
    console['log'](`${currentArgDateFormatted()} [DEV]`, ...args);
}

function logDebug(...args: any[]) {
    console['debug'](`${currentArgDateFormatted()} [DEBUG]`, ...args);
}

function logInfo(...args: any[]) {
    console['info'](`${currentArgDateFormatted()} [INFO]`, ...args);
}

function logWarn(...args: any[]) {
    console['warn'](`${currentArgDateFormatted()} [WARN]`, ...args);
}

function logError(...args: any[]) {
    console['error'](`${currentArgDateFormatted()} [ERROR]`, ...args);
}

function logFatal(...args: any[]) {
    console['error'](`${currentArgDateFormatted()} [FATAL]`, ...args);
}


function createLogger(level: number) {
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
 * Clien side logger
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
export const log = createLogger(logLevel);
