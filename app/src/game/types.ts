import type { ExposedReadable } from '$lib/stores/types.js';
import type { ClientToServerEvents, DeckIdentifier, Game, Player, RoomClient, SelfPlayer, ServerToClientEvents } from '$shared/types.js';
import type { Socket } from 'socket.io-client';


export * from '$shared/types.js';

export type SocketInstance = Socket<ServerToClientEvents, ClientToServerEvents>;

export type RoomStore = ExposedReadable<RoomClient>;

export type GameStore = ExposedReadable<Game>;

export type SelfStore = ExposedReadable<SelfPlayer>;

export type PlayersStore = ExposedReadable<Player[]>;

export type DecksStore = ExposedReadable<DeckIdentifier[]>;
