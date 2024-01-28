import { GAME_STATUS } from '$lib/enums';
import type { Game, Player } from '$types';
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
        init(room: Game) {
            _game = room;
            set(room);
        },
        get peek() {
            return _game;
        },
        subscribe,
    };
}

export const game = createGameStore();

export const players = derived([game], ([$game], set) => {
    set($game.players);
}, [] as Player[]);


export function isMe(player: Player) {
    return player.userId === user.peek?.id;
}


// socket.on('game_started', (data) => {
//     room.peek!.game = data;
//     socket.emit('get_new_round', { roomId: room.peek!.id, userId: user.peek!.id, options: room.peek!.game.maxOptions });
// });

// export function updateRoom(room: Room) {
//     socket.emit('update_room', { roomId: room.id, data: room });
// }

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
