import { dev } from '$app/environment';
import { db, users } from '$lib/server/db.js';
import { log } from '$lib/server/logging.ts';
import type { Handle, HandleServerError } from '@sveltejs/kit';
import { redirect, } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';


export const handle: Handle = async ({ event, resolve }) => {
    if (!dev && (
        event.route.id?.startsWith('/(dev)') || event.route.id?.startsWith('/decks')
    )) {
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

    log.error(`Uncaught error (${errorId}):\n`, error);
    if (!dev) {
        log.error(`Associated request (${errorId}):\n`, event.request);
    }

    return {
        id: errorId,
        message: status === 500 ? `Error interno del servidor. Id: ${errorId}` : message,
    };
};
