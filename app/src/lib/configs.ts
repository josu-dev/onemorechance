export const GAME = {
    DEFAULT_ROUNDS: 10,
    MIN_ROUNDS: 10,
    MAX_ROUNDS: 10,

    DEFAULT_SELECTION_TIME: 15 * 1000,
    MIN_CHOOSE_TIME: 5 * 1000,
    MAX_CHOOSE_TIME: 30 * 1000,

    DEFAULT_RATE_TIME: 15 * 1000,
    MIN_RATE_TIME: 5 * 1000,
    MAX_RATE_TIME: 30 * 1000,

    DEFAULT_OPTIONS: 8,
    MIN_OPTIONS: 4,
    MAX_OPTIONS: 12,

    DEFAULT_RESULTS_TIME: 30 * 1000,
    MIN_RESULTS_TIME: 10 * 1000,
    MAX_RESULTS_TIME: 60 * 1000,

    DEFAULT_SCOREBOARD_TIME: 30 * 1000,
    MIN_SCOREBOARD_TIME: 15 * 1000,
    MAX_SCOREBOARD_TIME: 45 * 1000,

    /** TEMPORAL: to be removed when room configuration is properly handled */
    DEFAULT_DECK_ID: '2',
} as const;