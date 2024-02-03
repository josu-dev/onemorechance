import type * as SocketIO from 'socket.io';
import type * as Client from '../src/game/types.client.js';
import type { ClientToServerEvents, ServerToClientEvents } from '../src/game/types.js';


export type InterServerEvents = Record<string, never>;

export type SocketData = {
    userId: string;
};

export type WebSocketServer = SocketIO.Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

export type WebSocketServerSocket = SocketIO.Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

export type { Client };

export type * from '../src/game/enums.js';

export type * from '../src/game/types.js';

export type User = {
    id: string,
    rooms: string[],
    client: Client.User,
};

export type Player = {
    userId: string,
    roomId: string,
    client: Client.Player,
};

export type Room = {
    id: string,
    room: Client.Room,
    game: Client.Game,
    players: Client.Player[],
};
