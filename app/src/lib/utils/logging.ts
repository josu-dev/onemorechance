import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { LOG_LEVEL_CLIENT } from '$lib/defaults.ts';
import { createLogger, numberFromEnv } from '$shared/utils.ts';


const logLevel = numberFromEnv(env.PUBLIC_LOG_LEVEL_SK_CLIENT, LOG_LEVEL_CLIENT);

/**
 * Client side only logger
 */
export const log = createLogger(logLevel, dev);
