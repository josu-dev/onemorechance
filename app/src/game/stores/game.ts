import type { Game, GameSettings, GameStatus, Option, PlayerRating, SocketStore } from '$game/types.js';
import type { GameStateStore } from '$game/types.ts';
import type { Readable } from '$lib/stores/types.js';
import { uniqueId, uniqueRoomId } from '$lib/utils/index.js';
import { log } from '$lib/utils/logging.ts';
import { GAME_STATUS } from "$shared/constants.js";
import { GAME } from '$shared/defaults.js';
import { derived, writable } from 'svelte/store';


export type GameStore = GameStateStore<Game>;


function defaultGame(): Game {
    return {
        id: uniqueId(),
        roomId: uniqueRoomId(),
        status: GAME_STATUS.NOT_STARTED,
        settings: {
            deckId: '',
            fillTime: GAME.DEFAULT_FILL_TIME,
            rateTime: GAME.DEFAULT_RATE_TIME,
            players: GAME.DEFAULT_PLAYERS,
            rounds: GAME.DEFAULT_ROUNDS,
            options: 0,
        },
        round: 0,
        deck: {
            id: uniqueId(),
            name: 'Not a deck',
            type: 'SELECT',
        },
        current: {
            sentence: {
                id: uniqueId(),
                text: 'Not a phrase',
            },
        },
        used: {
            sentences: [],
            options: [],
        },
    };
}

export function createGameStore(): GameStore {
    let _game: Game = defaultGame();

    const { subscribe, set } = writable<Game>(_game);

    return {
        subscribe,
        get value() {
            return _game;
        },
        mset(value) {
            if (_game !== value) {
                Object.assign(_game, value);
            }
            set(_game);
        },
        sync() {
            set(_game);
        },
        reset() {
            _game = defaultGame();
            set(_game);
        }
    };
}

export function createGameActions(socket: SocketStore, game: GameStore) {
    return {
        setSettings(settings: Partial<GameSettings>) {
            socket.instance.emit('game_set_settings', { roomId: game.value.roomId, settings: settings });
        },
        ratePlayer(playerId: string, rate: PlayerRating) {
            socket.instance.emit('game_rate_player', { roomId: game.value.roomId, playerId: playerId, rate: rate });
        },
        setSelectedOption(option: Option[]) {
            socket.instance.emit('game_set_option', { roomId: game.value.roomId, option: option });
        },
        setFreestyle(text: string[]) {
            socket.instance.emit('game_set_freestyle', { roomId: game.value.roomId, freestyle: text });
        }
    };
}

export function attachGameListeners(socket: SocketStore, game: GameStore) {
    socket.instance.on('game_player_rated', ({ playerId }) => {
        log.debug('game_player_rated', playerId);
        game.value.current.ratingPlayer = playerId;
        game.sync();
    });

    socket.instance.on('game_updated', (data) => {
        log.debug('game_updated', data);
        game.mset(data.game);
    });
}


export function createGameStatusStore(game: GameStore): Readable<GameStatus> {
    let currentStatus: GameStatus = GAME_STATUS.NOT_STARTED;

    const statusStore = derived(game, ($game) => {
        if ($game.status !== currentStatus) {
            currentStatus = $game.status;
        }
        return currentStatus;
    });

    return statusStore;
}
