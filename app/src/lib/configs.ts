import { PUBLIC_SK_LOG_LEVEL, PUBLIC_SK_LOG_LEVEL_CLIENT } from '$env/static/public';


const DEFAULT_LOG_LEVEL = 3;

function getLogLevel(level: string): number {
    const value = parseInt(level);
    return isNaN(value) ? DEFAULT_LOG_LEVEL : value;
}

export const logLevel = getLogLevel(PUBLIC_SK_LOG_LEVEL);

export const logLevelClient = getLogLevel(PUBLIC_SK_LOG_LEVEL_CLIENT);
