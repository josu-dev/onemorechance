import type { GameStatus, PlayerRating } from '$game/enums';
import { GAME_STATUS } from '$game/enums';
import type { Option } from '$game/types';
import type { Game, GameStore, SelfStore, SocketInstance } from '$game/types.client';
import type { Readable } from '$lib/stores/types';
import { uniqueLettersId, uniqueURLSafeId } from '$lib/utils';
import { derived, writable } from 'svelte/store';


function defaultGame(): Game {
    return {
        id: uniqueURLSafeId(),
        roomId: uniqueLettersId(),
        status: GAME_STATUS.NOT_STARTED,
        maxRounds: 0,
        maxOptions: 0,
        chooseTime: 0,
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
    socket.on('game_rate_player', ({ playerId }) => {
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
