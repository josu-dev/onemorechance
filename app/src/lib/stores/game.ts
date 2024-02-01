import { GAME_STATUS, type PlayerRating } from '$lib/enums';
import { socket } from '$lib/ws.js';
import type { Game, Option, Player } from '$types';
import { derived, writable } from 'svelte/store';
import { room } from './room';
import type { ExposedReadable } from './types';
import { user } from './user';


const FALLBACK_GAME: Game = {
    id: '',
    status: GAME_STATUS.NOT_STARTED,
    maxRounds: 0,
    maxOptions: 0,
    chooseTime: 0,
    round: 0,
    deck: {
        id: '',
        name: '',
        type: 'CHOOSE',
    },
    phrase: {
        id: '',
        text: '',
    },
    usedPhrases: [],
    usedOptions: [],
    players: [],
};


function createGameStore(): ExposedReadable<Game> {
    let _game: Game = FALLBACK_GAME;

    const { subscribe, set } = writable<Game>(_game);

    room.subscribe(($room) => {
        _game = $room?.game || FALLBACK_GAME;
        set(_game);
    });

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


export const game = createGameStore();

export const players = derived(game, ($game) => {
    return $game.players;
}, [] as Player[]);


socket.on('rate_next_player', ({ playerId }) => {
    game.value.ratingPlayer = playerId;
    game.sync();
});


export function isMe(player: Player) {
    return player.userId === user.value?.id;
}

export function ratePlayer(playerId: string, rate: PlayerRating) {
    socket.emit('rate_player', { roomId: room.value!.id, playerId: playerId, rate: rate });
}

export function setSelectedOption(option: Option) {
    socket.emit('option_selected', { roomId: room.value!.id, userId: user.value!.id, option: option });
}

export function setFreestyle(text: string | string[]) {
    socket.emit('freestyle_selected', { roomId: room.value!.id, userId: user.value!.id, freestyle: Array.isArray(text) ? text : [text] });
}

// export function setReady() {
//     socket.emit('player_ready', { roomId: room.value!.id, userId: user.value!.id });
// }

// export function setUnready() {
//     socket.emit('player_unready', { roomId: room.value!.id, userId: user.value!.id });
// }

// export function startGame() {
//     const userId = user.value!.id;
//     if (room.value?.host.id !== userId) {
//         return;
//     }
//     socket.emit('start_game', { roomId: room.value!.id, userId: userId });
// }
