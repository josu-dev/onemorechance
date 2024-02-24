import { rooms } from '$lib/server/db.js';
import { redirectToRegister } from '$lib/server/utils.js';
import { ROOM_STATUS } from '$shared/constants.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';


export const load: PageServerLoad = async ({ locals, params, url }) => {
    if (!locals.user) {
        redirectToRegister(url, 'Debes estar registrado para unirte a una sala');
    }

    const room = await locals.db.select().from(rooms).where(eq(rooms.id, params.id)).get();
    if (!room) {
        error(404, { friendly: 'La sala no existe' });
    }
    if (room.status === ROOM_STATUS.CLOSED) {
        error(400, { friendly: 'La sala esta cerrada' });
    }

    return {
        user: locals.user,
        room: room,
    };
};
