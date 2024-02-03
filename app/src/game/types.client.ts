import type { GameStatus, PlayerRole, RoomStatus } from '$game/enums';
import type { DeckIdentifier, Option, Phrase } from '$game/types';
import type { ClientToServerEvents, ServerToClientEvents } from '$game/types';
import type { ExposedReadable } from '$lib/stores/types';
import type { Socket } from 'socket.io-client';


export type SocketInstance = Socket<ServerToClientEvents, ClientToServerEvents>;


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

export type Game = {
    id: string;
    roomId: string;
    status: GameStatus;
    maxRounds: number;
    maxOptions: number;
    chooseTime: number;
    round: number,
    deck: DeckIdentifier,
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
    totalScore: number,
    ready: boolean,
    current: {
        modifier?: string,
        option?: Option[],
        freestyle?: string[],
    },
    stock: {
        options: Option[]
        modifiers: string[],
    },
    used: {
        options: Option[],
        modifiers: string[],
        freestyle: string[],
    },
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
