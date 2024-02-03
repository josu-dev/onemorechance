import { ROOM_STATUS } from '$game/enums';
import { room, self } from '$game/game';
import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';


export const ssr = false;

export const load: PageLoad = async () => {
    if (room.value.status === ROOM_STATUS.NO_ROOM) {
        redirect(302, '/');
    }

    // updateAvailableDecks();

    const isHost = self.value?.id === room.value.hostId;

    return {
        isHost: isHost,
    };
};
