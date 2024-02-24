import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { LOG_LEVEL_CLIENT, TOAST } from '$lib/defaults.ts';
import { createLogger, numberFromEnv } from '$shared/utils.ts';
import * as sftoast from 'svelte-french-toast';
import type { ValidationErrors } from 'sveltekit-superforms';


const logLevel = numberFromEnv(env.PUBLIC_LOG_LEVEL_SK_CLIENT, LOG_LEVEL_CLIENT);

/**
 * Client side only logger
 */
export const log = createLogger(logLevel, dev);

export function copyToClipboard(
    text: string,
) {
    navigator.clipboard.writeText(text).catch(console['error']);
}

type AnyTuple = [] | [any, ...any[]];

export function debounced<A extends AnyTuple, EA extends AnyTuple>(
    fn: (...args: [...A, ...EA]) => void, delay: number, ...extraArgs: EA
) {
    let timeoutId: ReturnType<typeof setTimeout> | undefined = undefined;

    function _debounced(...args: A) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args, ...extraArgs), delay);
    }

    _debounced.cancel = () => clearTimeout(timeoutId);

    return _debounced;
}

export function toastFormLevelErrors<T extends Record<string, unknown>>(errors: ValidationErrors<T>) {
    if (!errors._errors || errors._errors.length === 0) {
        return false;
    }

    sftoast.toast.error(String(errors._errors), { duration: TOAST.DURATION_ERROR });
    return true;
}

export const toast = {
    error: (message: sftoast.Renderable) => sftoast.toast.error(message, { duration: TOAST.DURATION_ERROR }),
    info: (message: sftoast.Renderable) => sftoast.toast.success(message, { duration: TOAST.DURATION_INFO, icon: '📨' }),
    success: (message: sftoast.Renderable) => sftoast.toast.success(message, { duration: TOAST.DURATION_SUCCESS }),
    warn: (message: sftoast.Renderable) => sftoast.toast.success(message, { duration: TOAST.DURATION_WARNING, icon: '🚧' }),
    formLevelErrors: toastFormLevelErrors,
};


/**
 * Register a callback to be called when the user first interacts with the page.
 * If the user has already interacted, the callback is called immediately.
 *
 * Safe to call in server side code, it does nothing and returns a noop.
 */
export const onFirstUserInteraction = (() => {
    let interacted = false;

    const userInteractionCallbacks = new Set<() => void>();

    const userInteractionEvents = [
        'keydown',
        'pointerdown',
    ];

    function handler() {
        interacted = true;
        for (const cb of userInteractionCallbacks) {
            cb();
        }
        userInteractionCallbacks.clear();
        for (const event of userInteractionEvents) {
            document.removeEventListener(event, handler);
        }
    }

    for (const event of userInteractionEvents) {
        document.addEventListener(event, handler);
    }

    function noop() { }

    function addListener(cb: () => void) {
        if (interacted) {
            cb();
            return noop;
        }

        userInteractionCallbacks.add(cb);
        return () => userInteractionCallbacks.delete(cb);
    }

    return addListener;
})();
