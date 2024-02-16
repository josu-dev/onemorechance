import type { ExposedReadablePartial } from '$lib/stores/types.ts';


export type * from '$shared/types.js';

export interface GameStateStore<T> extends ExposedReadablePartial<T> {
    /**
     * Reset the game state to its default value.
     */
    reset(): void;
}

export type { SocketStore } from '$game/stores/socket.ts';

export type { SelfStore } from '$game/stores/self.ts';

export type { RoomStore } from '$game/stores/room.ts';

export type { GameStore } from '$game/stores/game.ts';

export type { PlayersStore } from '$game/stores/players.ts';
