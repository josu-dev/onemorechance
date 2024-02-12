import { room, self, socketActions } from '$game/game.js';
import type { PageLoad } from './$types.js';


export const load: PageLoad = async ({ data }) => {
    self.value.id = data.user.id;
    self.value.name = data.user.name;
    self.sync();

    room.mset({
        id: data.room.id,
        status: 'CONNECTING',
        maxPlayers: data.room.playersMax,
        hostId: data.room.hostId,
    });

    socketActions.connect();

    return {};
};
