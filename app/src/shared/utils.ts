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

function logCore(...args: any[]) {
    console['log'](`${currentArgDateFormatted()} [CORE]`, ...args);
}

type LogFunction = (...args: any[]) => void;

type Logger = {
    /**
     * Logs only in development mode
     */
    dev: LogFunction,
    /**
     * Logs in development mode or when log level is 4 or higher
     */
    debug: LogFunction,
    /**
     * Logs in development mode or when log level is 3 or higher
     */
    info: LogFunction,
    /**
     * Logs when log level is 2 or higher
     */
    warn: LogFunction,
    /**
     * Logs when log level is 1 or higher
     */
    error: LogFunction,
    /**
     * Logs always
     */
    fatal: LogFunction,
    /**
     * Logs always
     */
    core: LogFunction,
};

export function createLogger(level: number, dev: boolean): Logger {
    return {
        dev: dev ? logDev : logNoop,
        debug: dev || level >= 4 ? logDebug : logNoop,
        info: dev || level >= 3 ? logInfo : logNoop,
        warn: level >= 2 ? logWarn : logNoop,
        error: level >= 1 ? logError : logNoop,
        fatal: logFatal,
        core: logCore,
    };
}

export function numberFromEnv(env: string | undefined, defaultValue: number): number {
    if (!env) {
        return defaultValue;
    }
    const value = parseInt(env);
    if (isNaN(value)) {
        return defaultValue;
    }
    return value;
}
