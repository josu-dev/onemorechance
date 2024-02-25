import { browser } from '$app/environment';
import { room, self, socketActions } from '$game/game.js';
import type { PageLoad } from './$types.js';


export const load: PageLoad = async ({ data }) => {
    if (!self.value.loaded) {
        self.value.loaded = true;
        self.value.user = data.user;
        self.sync();
    }

    room.mset({
        id: data.room.id,
        status: 'CONNECTING',
        maxPlayers: data.room.playersMax,
        hostId: data.room.hostId,
    });

    if (!browser) {
        return {};
    }

    socketActions.connect(data.user.id);
    return {};
};
