import type * as SocketIO from 'socket.io';
import * as Shared from '../src/shared/types.js';

export type * from '../src/shared/types.js';

export type * from '../src/shared/constants.js';

export type InterServerEvents = Record<string, never>;

export type SocketData = {
    userId: string;
};

export type WebSocketServer = SocketIO.Server<
    Shared.ClientToServerEvents,
    Shared.ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

export type WebSocketServerSocket = SocketIO.Socket<
    Shared.ClientToServerEvents,
    Shared.ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

export type ServerUser = {
    id: string,
    client: Shared.User,
    rooms: string[],
    socketId: string,
};

export type ServerPlayer = {
    userId: string,
    roomId: string,
    client: Shared.Player,
};

export type ServerRoom = {
    id: string,
    room: Shared.Room,
    game: Shared.Game,
    players: Shared.Player[],
    deck: Shared.DeckCompact,
};
