import { dev } from '$app/environment';
import { db } from '$lib/server/db.js';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle = (async ({ event, resolve }) => {
    const name = event.cookies.get('name');
    const userId = event.cookies.get('userId');
    if (name && userId) {
        event.locals.user = {
            id: userId,
            name: name,
        };
    }

    if (!dev && (
        event.route.id?.startsWith('/(dev)') || event.route.id?.startsWith('/decks')
    )) {
        redirect(302, '/');
    }

    event.locals.db = db;

    const response = await resolve(event);

    return response;
}) satisfies Handle;
