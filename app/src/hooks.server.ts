import type { Handle } from '@sveltejs/kit';


export const handle = (async ({ event, resolve }) => {
    event.locals.name = event.cookies.get('name')
    event.locals.userId = event.cookies.get('userId')
    
    const response = await resolve(event);

    return response;
}) satisfies Handle;
