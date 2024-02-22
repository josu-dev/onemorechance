import { dev } from '$app/environment';
import { env } from '$env/dynamic/private';
import { LOG_LEVEL } from '$lib/defaults.js';
import { createLogger, numberFromEnv } from '$shared/utils.js';
import { redirect } from '@sveltejs/kit';


export function redirectIfParam(
    url: URL,
) {
    const redirectTo = url.searchParams.get('redirect_to');
    if (redirectTo) {
        redirect(302, `/${redirectTo.trim().slice(1)}`);
    }
}

export function redirectToRegister(
    url: URL,
    message = ''
): never {
    const redirectTo = url.pathname + url.search;
    redirect(302, `/?redirect_to=${redirectTo}&message=${encodeURIComponent(message)}`);
}


const encoder = new TextEncoder();

/**
 * Mirrors the `json` function from '@sveltejs/kit', but enables prettifying the JSON.
 */
export function json(data: any, init?: ResponseInit, space?: number) {
    const body = JSON.stringify(data, undefined, space);

    const headers = new Headers(init?.headers);
    if (!headers.has('content-type')) {
        headers.set('content-type', 'application/json');
    }
    if (!headers.has('content-length')) {
        headers.set('content-length', encoder.encode(body).byteLength.toString());
    }

    return new Response(body, {
        ...init,
        headers,
        status: 200
    });
}


const logLevel = numberFromEnv(env.LOG_LEVEL_SK, LOG_LEVEL);

/**
 * Server side only logger
 */
export const log = createLogger(logLevel, dev);
