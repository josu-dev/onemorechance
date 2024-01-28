import { GAME_STATUS, type PlayerRating } from '$lib/enums';
import { socket } from '$lib/ws';
import type { Game, Option, Player } from '$types';
import { derived, writable } from 'svelte/store';
import { room } from './room';
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
        type: 'COMPLETE',
    },
    phrase: {
        id: '',
        text: '',
    },
    usedPhrases: [],
    usedOptions: [],
    players: [],
};


function createGameStore() {
    let _game: Game;

    const { subscribe, set } = writable<Game>(FALLBACK_GAME);

    room.subscribe((room) => {
        _game = room?.game || FALLBACK_GAME;
        set(_game);
    });

    return {
        init(game: Game) {
            _game = game;
            set(game);
        },
        get peek() {
            return _game;
        },
        subscribe,
    };
}

export const game = createGameStore();

export const players = derived(game, ($game) => {
    return $game.players;
}, [] as Player[]);


export function isMe(player: Player) {
    return player.userId === user.peek?.id;
}

export function ratePlayer(playerId: string, rate: PlayerRating) {
    socket.emit('rate_player', { roomId: room.peek!.id, playerId: playerId, rate: rate });
}

export function setSelectedOption(option: Option) {
    socket.emit('option_selected', { roomId: room.peek!.id, userId: user.peek!.id, option: option });
}

export function setFreestyle(text: string | string[]) {
    socket.emit('freestyle_selected', { roomId: room.peek!.id, userId: user.peek!.id, freestyle: Array.isArray(text) ? text : [text] });
}

// export function setReady() {
//     socket.emit('player_ready', { roomId: room.peek!.id, userId: user.peek!.id });
// }

// export function setUnready() {
//     socket.emit('player_unready', { roomId: room.peek!.id, userId: user.peek!.id });
// }

// export function startGame() {
//     const userId = user.peek!.id;
//     if (room.peek?.host.id !== userId) {
//         return;
//     }
//     socket.emit('start_game', { roomId: room.peek!.id, userId: userId });
// }
