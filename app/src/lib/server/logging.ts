import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { LOG_LEVEL } from '$lib/defaults.ts';
import { createLogger, numberFromEnv } from '$shared/utils.ts';


const logLevel = numberFromEnv(env.LOG_LEVEL_SK, LOG_LEVEL);

/**
 * Server side only logger
 */
export const log = createLogger(logLevel, dev);
