import { dev } from '$app/environment';
import { db, users } from '$lib/server/db.js';
import { log } from '$lib/server/logging';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { redirect, } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';


export const handle: Handle = async ({ event, resolve }) => {
    if (!dev && event.route.id?.startsWith('/(dev)')) {
        redirect(302, '/');
    }

    const userId = event.cookies.get('userId');
    if (userId) {
        const user = await db.select().from(users).where(eq(users.id, userId)).get();
        event.locals.user = user;
    }

    event.locals.db = db;

    const response = await resolve(event);

    return response;
};


export const handleError: HandleServerError = async ({ error, event, status, message }) => {
    const errorId = nanoid();
    const isNotFound = status === 404;

    if (isNotFound) {
        log.error(`Unhandled not found error (${errorId}):\n`, error);
    }
    else {
        log.fatal(`Uncaught error (${errorId}):\n`, error);
        if (!dev) {
            log.fatal(`Associated request (${errorId}):\n`, event.request);
        }
    }

    const errorMessage = status === 500 ?
        `Error interno del servidor. Id: ${errorId}` :
        isNotFound ?
            `No se encontró el recurso solicitado. Id: ${errorId}` :
            message;

    return {
        id: errorId,
        message: errorMessage,
    };
};
