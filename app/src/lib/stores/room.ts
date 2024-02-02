import { goto } from '$app/navigation';
import { socket } from '$lib/ws.js';
import type { Room, User } from '$types';
import { derived, writable } from 'svelte/store';
import { user } from './user';


function createRoomStore() {
    let _room: Room | undefined;
    const { subscribe, set } = writable<Room | undefined>(undefined);

    return {
        init(room: Room) {
            _room = room;
            set(room);
        },
        get peek() {
            return _room;
        },
        subscribe,
        set,
    };
}

export const room = createRoomStore();

export const roomUsers = derived(room, ($roomStore) => {
    if (!$roomStore) {
        return [];
    }

    return $roomStore.users;
}, [] as User[]);


socket.on('created_room', (data) => {
    room.init(data);

    goto(`/${data.id}`);
});

socket.on('updated_room', (data) => {
    room.init(data);
});

socket.on('joined_room', (data) => {
    room.init(data);

    goto(`/${data.id}`);
});

socket.on('user_join_room', (data) => {
    const _room = room.peek;
    if (user.peek?.id === data.user.id || !_room) {
        return;
    }

    _room.users.push(data.user);
    _room.game.players.push(data.player);
    room.set(_room);
});

socket.on('game_deck_update', (data) => {
    const _room = room.peek;
    if (!_room) {
        return;
    }
    _room.game.deck = data;
    room.set(_room);
});

socket.on('game_started', (data) => {
    room.peek!.game = data;
    // socket.emit('get_new_round', { roomId: room.peek!.id, userId: user.peek!.id, options: room.peek!.game.maxOptions });
});

socket.on('game_updated', (data) => {
    const _room = room.peek;
    if (!_room) {
        return;
    }
    _room.game = data;
    room.set(_room);
});

socket.on('game_status_update', (data) => {
    const _room = room.peek;
    if (!_room) {
        return;
    }
    _room.game.status = data.status;
    room.set(_room);
});

socket.on('player_updated', (data) => {
    const _room = room.peek;
    if (!_room) {
        return;
    }
    const playerIndex = _room.game.players.findIndex((p) => p.userId === data.userId);
    if (playerIndex === -1) {
        return;
    }
    _room.game.players[playerIndex] = data;
    room.set(_room);
});


export function updateRoom(room: Room) {
    socket.emit('update_room', { roomId: room.id, data: room });
}

export function setGameDeck(deckId: string) {
    if (!room.peek) {
        return;
    }
    socket.emit('update_room_deck', { roomId: room.peek.id, deckId: deckId });
}

export function setReady() {
    socket.emit('player_ready', { roomId: room.peek!.id, userId: user.peek!.id });
}

export function setUnready() {
    socket.emit('player_unready', { roomId: room.peek!.id, userId: user.peek!.id });
}

export function startGame() {
    const userId = user.peek!.id;
    if (room.peek?.host.id !== userId) {
        return;
    }
    socket.emit('start_game', { roomId: room.peek!.id, userId: userId });
}
