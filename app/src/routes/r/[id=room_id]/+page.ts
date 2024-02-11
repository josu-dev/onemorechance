import { room } from '$game/game.js';
import type { PageLoad } from './$types.js';


export const load: PageLoad = async ({ data }) => {
    room.mset({
        id: data.room.id,
        status: 'CONNECTING',
        maxPlayers: data.room.playersMax,
        hostId: data.room.hostId,
    });

    return {};
};
