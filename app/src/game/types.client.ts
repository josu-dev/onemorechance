import type { Socket } from 'socket.io-client';
import type { ExposedReadable } from '../lib/stores/types.js';
import type { GameStatus, PlayerRole, RoomStatus } from './enums.js';
import type { ClientToServerEvents, DeckIdentifier, Option, Phrase, ServerToClientEvents } from './types.js';


export type SocketInstance = Socket<ServerToClientEvents, ClientToServerEvents>;

export type User = {
    id: string,
    name: string,
    socketId: string,
};

// #region Room

export type Room = {
    id: string,
    name?: string,
    status: RoomStatus,
    hostId: string,
    maxPlayers: number,
};

export type RoomStore = ExposedReadable<Room>;

// #endregion

// #region Game

export type GameSettings = {
    deckId: string,
    fillTime: number,
    options: number,
    players: number,
    rateTime: number,
    rounds: number,
};

export type Game = {
    id: string;
    roomId: string;
    status: GameStatus;
    settings: GameSettings;
    deck: DeckIdentifier,
    round: number,
    current: {
        phrase: Phrase,
        ratingPlayer?: string,
        winner?: string,
    },
    used: {
        phrases: string[],
        options: string[],
    },
};

export type GameStore = ExposedReadable<Game>;

export type Player = {
    id: string,
    name: string,
    role: PlayerRole,
    score: number,
    scoreLast: number,
    scoreTotal: number,
    ready: boolean,
    current: {
        modifier?: string,
        option?: Option[],
        freestyle?: string[],
    },
    stock: {
        options: Option[];
        modifiers: string[],
    },
    used: {
        options: Option[],
        modifiers: string[],
        freestyle: string[],
    },
    ratesReceived: Record<string, string>,
};

export type SelfPlayer = Player & {
    registered: boolean,
    socketId: string,
};

export type SelfStore = ExposedReadable<SelfPlayer>;

export type PlayersStore = ExposedReadable<Player[]>;

// #endregion

// #region Decks

export type DecksStore = ExposedReadable<DeckIdentifier[]>;

// #endregion
