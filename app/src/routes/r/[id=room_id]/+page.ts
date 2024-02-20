import { browser } from '$app/environment';
import { room, self, socketActions } from '$game/game.js';
import { decks } from '$lib/stores/decks.js';
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

    decks.mset(data.decks);

    socketActions.connect(data.user.id);
    return {};
};
