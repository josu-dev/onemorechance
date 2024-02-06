export const ROOM_STATUS = {
    NO_ROOM: 'NO_ROOM',
    CONNECTING: 'CONNECTING',
    FULL: 'FULL',
    IN_LOBBY: 'IN_LOBBY',
    IN_GAME: 'IN_GAME',
    CLOSED: 'CLOSED',
    LEFT: 'LEFT',
} as const;

export type RoomStatus = typeof ROOM_STATUS[keyof typeof ROOM_STATUS];


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

export type GameStatus = typeof GAME_STATUS[keyof typeof GAME_STATUS];


export const PLAYER_ROLE = {
    HOST: 'HOST',
    GUEST: 'GUEST',
} as const;

export type PlayerRole = typeof PLAYER_ROLE[keyof typeof PLAYER_ROLE];


export const PLAYER_RATING = {
    GOD: 'GOOD',
    MEH: 'MEH',
    BAD: 'BAD',
} as const;

export type PlayerRating = typeof PLAYER_RATING[keyof typeof PLAYER_RATING];


export const DECK_TYPE = {
    CHOOSE: 'CHOOSE',
    COMPLETE: 'COMPLETE',
} as const;

export type DeckType = typeof DECK_TYPE[keyof typeof DECK_TYPE];
