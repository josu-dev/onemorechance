import { GAME } from '$game/configs.js';
import type { GameStatus, PlayerRating } from '$game/enums.js';
import { GAME_STATUS } from '$game/enums.js';
import type { Game, GameSettings, GameStore, SelfStore, SocketInstance } from '$game/types.client.js';
import type { Option } from '$game/types.js';
import type { Readable } from '$lib/stores/types.js';
import { uniqueRoomId, uniqueURLSafeId } from '$lib/utils/index.js';
import { derived, writable } from 'svelte/store';


function defaultGame(): Game {
    return {
        id: uniqueURLSafeId(),
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
            id: uniqueURLSafeId(),
            name: 'Not a deck',
            type: 'CHOOSE',
        },
        current: {
            phrase: {
                id: uniqueURLSafeId(),
                text: 'Not a phrase',
            },
        },
        used: {
            phrases: [],
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
        sync() {
            set(_game);
        },
        mset(value: Game) {
            _game = value;
            set(value);
        },
    };
}

export function createGameActions(socket: SocketInstance, self: SelfStore, game: GameStore,) {
    return {
        setSettings(settings: Partial<GameSettings>) {
            socket.emit('game_set_settings', { roomId: game.value.roomId, settings: settings });
        },
        ratePlayer(playerId: string, rate: PlayerRating) {
            socket.emit('game_rate_player', { roomId: game.value.roomId, playerId: playerId, rate: rate });
        },
        setSelectedOption(option: Option[]) {
            socket.emit('game_set_option', { roomId: game.value.roomId, option: option });
        },
        setFreestyle(text: string[]) {
            socket.emit('game_set_freestyle', { roomId: game.value.roomId, freestyle: text });
        }
    };
}

export function attachGameListeners(socket: SocketInstance, game: GameStore) {
    socket.on('game_player_rated', ({ playerId }) => {
        game.value.current.ratingPlayer = playerId;
        game.sync();
    });

    socket.on('game_updated', (data) => {
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
