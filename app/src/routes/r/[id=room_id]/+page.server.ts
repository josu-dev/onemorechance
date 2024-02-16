import type { DeckIdentifier } from '$game/types.js';
import { rooms } from '$lib/server/db.js';
import { redirectToRegister } from '$lib/utils/index.js';
import { log } from '$lib/utils/logging.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types.js';


export const load: PageServerLoad = async ({ locals, params, url, fetch }) => {
    if (!locals.user) {
        redirectToRegister(url, 'Debes estar registrado para unirte a una sala');
    }

    const room = await locals.db.select().from(rooms).where(eq(rooms.id, params.id)).get();
    if (!room) {
        error(404, 'La sala no existe');
    }
    if (room.status === 'CLOSED') {
        error(400, 'La sala esta cerrada');
    }
    // if (room.playersCount >= room.playersMax) {
    //     error(400, 'La sala esta llena');
    // }

    // await locals.db.update(rooms).set({ playersCount: room.playersCount + 1 }).where(eq(rooms.id, params.id));
    // room.playersCount += 1;

    const decks: (DeckIdentifier & { sentencesCount: number; })[] = await (
        fetch('/api/v1/decks?page=1&limit=100')
            .then((res) => {
                if (!res.ok) {
                    return [];
                }
                return res.json();
            })
            .catch((e) => {
                log.debug('Failed to fetch decks', e);
                return [];
            })
    );

    return {
        user: locals.user,
        room: room,
        decks: decks,
    };
};
