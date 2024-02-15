type Values<T> = T[keyof T];

export const ROOM_STATUS = {
    CLOSED: 'CLOSED',
    GAME_ON: 'GAME_ON',
    WAITING: 'WAITING',
} as const;

export type RoomStatus = Values<typeof ROOM_STATUS>;

export const ROOM_STATUS_CLIENT = {
    ...ROOM_STATUS,
    NO_ROOM: 'NO_ROOM',
    CONNECTING: 'CONNECTING',
    CONNECTION_LOST: 'CONNECTION_LOST',
    KICKED: 'KICKED',
    FULL: 'FULL',
    LEFT: 'LEFT',
} as const;

export type RoomStatusClient = Values<typeof ROOM_STATUS_CLIENT>;

export const GAME_STATUS = {
    NOT_STARTED: 'NOT_STARTED',
    PRE_ROUND: 'PRE_ROUND',
    FILL_SENTENCE: 'FILL_SENTENCE',
    RATE_SENTENCE: 'RATE_SENTENCE',
    ROUND_WINNER: 'ROUND_WINNER',
    POST_ROUND: 'POST_ROUND',
    END_SCOREBOARD: 'END_SCOREBOARD',
    ENDED: 'ENDED',
} as const;

export type GameStatus = Values<typeof GAME_STATUS>;

export const PLAYER_ROLE = {
    HOST: 'HOST',
    GUEST: 'GUEST',
} as const;

export type PlayerRole = Values<typeof PLAYER_ROLE>;

export const PLAYER_RATING = {
    GOD: 'GOOD',
    MEH: 'MEH',
    BAD: 'BAD',
} as const;

export type PlayerRating = Values<typeof PLAYER_RATING>;

export const DECK_TYPE = {
    COMPLETE: 'COMPLETE',
    SELECT: 'SELECT',
} as const;

export type DeckType = Values<typeof DECK_TYPE>;
