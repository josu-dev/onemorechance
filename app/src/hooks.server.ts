import { dev } from '$app/environment';
import { db, users } from '$lib/server/db.js';
import { redirect, type Handle } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';


export const handle = (async ({ event, resolve }) => {
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
}) satisfies Handle;
