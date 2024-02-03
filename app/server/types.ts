import type * as Client from '../src/game/types.client.js';


export type * from '../src/game/types.js';
export type * from '../src/game/enums.js';

export type { Client };

export type Room = {
    room: Client.Room,
    game: Client.Game,
    players: Client.Player[],
};
