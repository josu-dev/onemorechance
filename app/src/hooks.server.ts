import { dev } from '$app/environment';
import { redirect, type Handle } from '@sveltejs/kit';


export const handle = (async ({ event, resolve }) => {
    event.locals.name = event.cookies.get('name')
    event.locals.userId = event.cookies.get('userId')

    if (!dev && event.route.id?.startsWith('/(dev)')) {
        redirect(302, '/')
    }
    
    const response = await resolve(event);

    return response;
}) satisfies Handle;
