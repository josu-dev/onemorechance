import { error, type RequestHandler } from '@sveltejs/kit';
import {getPendingUpdates} from '$lib/server/rooms';


export const GET: RequestHandler = async ({url, params}) => {
    const roomId = params.id;
    if (!roomId) {
        error(404, 'Game not found');
    }

    const lastUpdate = parseInt(url.searchParams.get('lastUpdate')||'');

    const pendingUpdates = await getPendingUpdates(roomId, isNaN(lastUpdate) ? Date.now() : lastUpdate);

    return new Response(JSON.stringify(pendingUpdates), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
};
