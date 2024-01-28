export const GAME_STATUS = {
    WAITING_TO_START: 'WAITING_TO_START',
    IN_PROGRESS: 'IN_PROGRESS',
    ROUND_ENDED: 'ROUND_ENDED',
    SELECTION_END: 'SELECTION_END',
    FINISHED: 'FINISHED',
} as const;

export type GameStatus = typeof GAME_STATUS[keyof typeof GAME_STATUS]
