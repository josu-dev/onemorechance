import type { RequestHandler } from '@sveltejs/kit';
import { nanoid } from 'nanoid';


export const POST: RequestHandler = async ({ request, cookies }) => {
    let { name, userId } = await request.json();
    if (!name && !userId) {
        cookies.delete('name', { path: '/' });
        cookies.delete('userId', { path: '/' });
        return new Response();
    }
    if (!name) {
        cookies.delete('name', { path: '/' });
        return new Response();
    }

    if (!userId) {
        userId = nanoid();
    }

    cookies.set('name', name, { path: '/' });
    cookies.set('userId', userId, { path: '/' });

    return new Response();
};
