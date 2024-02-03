import { ROOM_STATUS } from '$game/enums.js';
import { room } from '$game/game.js';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';


export const ssr = false;

export const load: PageLoad = async () => {
    if (room.value.status === ROOM_STATUS.NO_ROOM) {
        redirect(302, '/');
    }

    return {
    };
};
