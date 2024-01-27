import type { RequestHandler } from '@sveltejs/kit';


export const POST: RequestHandler = async ({ cookies, request }) => {
    const data = await request.json();
    if (data.event === 'updateSswsId') {
        cookies.set('sswsId', data.data, { path: '/' });
        console.log('set sswsId cookie', data.data);
    }

    return new Response();
};
