import { dev } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';


export const handle = (async ({ event, resolve }) => {
    const name = event.cookies.get('name');
    const userId = event.cookies.get('userId');
    if (name && userId) {
        event.locals.user = {
            id: userId,
            name,
        };
    }

    if (!dev && event.route.id?.startsWith('/(dev)')) {
        redirect(302, '/');
    }

    const response = await resolve(event);

    return response;
}) satisfies Handle;
