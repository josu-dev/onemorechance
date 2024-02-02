import { goto } from '$app/navigation';
import { socket } from '$lib/ws.js';
import type { Room } from '$types';
import { derived, writable } from 'svelte/store';
import type { ExposedReadable } from './types';
import { user } from './user';


function createRoomStore(): ExposedReadable<Room | undefined> {
    let _room: Room | undefined = undefined;

    const { subscribe, set } = writable<Room | undefined>(_room);

    return {
        subscribe,
        get value() {
            return _room;
        },
        sync() {
            set(_room);
        },
        mset(value?: Room) {
            _room = value;
            set(value);
        },
    };
}


export const room = createRoomStore();

export const roomUsers = derived(room, ($roomStore) => {
    if (!$roomStore) {
        return [];
    }

    return $roomStore.users;
}, []);


socket.on('created_room', (data) => {
    room.mset(data);

    goto(`/${data.id}`);
});

socket.on('updated_room', (data) => {
    room.mset(data);
});

socket.on('joined_room', (data) => {
    room.mset(data);

    goto(`/${data.id}`);
});

socket.on('user_join_room', (data) => {
    const _room = room.value;
    if (user.value?.id === data.user.id || !_room) {
        return;
    }

    _room.users.push(data.user);
    _room.game.players.push(data.player);
    room.mset(_room);
});

socket.on('game_deck_update', (data) => {
    const _room = room.value;
    if (!_room) {
        return;
    }
    _room.game.deck = data;
    room.mset(_room);
});

socket.on('game_started', (data) => {
    const _room = room.value;
    if (!_room) {
        return;
    }
    _room.status= 'PLAYING';
    _room.game = data;
    room.sync();
    // socket.emit('get_new_round', { roomId: room.value!.id, userId: user.value!.id, options: room.value!.game.maxOptions });
});

socket.on('game_updated', (data) => {
    const _room = room.value;
    if (!_room) {
        return;
    }
    _room.game = data;
    room.mset(_room);
});

socket.on('game_status_update', (data) => {
    const _room = room.value;
    if (!_room) {
        return;
    }
    _room.game.status = data.status;
    room.mset(_room);
});

socket.on('player_updated', (data) => {
    const _room = room.value;
    if (!_room) {
        return;
    }
    const playerIndex = _room.game.players.findIndex((p) => p.userId === data.userId);
    if (playerIndex === -1) {
        return;
    }
    _room.game.players[playerIndex] = data;
    room.mset(_room);
});


export function updateRoom(room: Room) {
    socket.emit('update_room', { roomId: room.id, data: room });
}

export function setGameDeck(deckId: string) {
    if (!room.value) {
        return;
    }
    socket.emit('update_room_deck', { roomId: room.value.id, deckId: deckId });
}

export function setReady(ready?: boolean) {
    socket.emit(
        ready ? 'player_ready' : 'player_unready',
        { roomId: room.value!.id, userId: user.value!.id }
    );
}

export function setUnready() {
    socket.emit('player_unready', { roomId: room.value!.id, userId: user.value!.id });
}

export function startGame() {
    const userId = user.value!.id;
    if (room.value?.host.id !== userId) {
        return;
    }
    socket.emit('start_game', { roomId: room.value!.id, userId: userId });
}

export function closeRoom() {
    const userId = user.value?.id;
    if (!userId) {
        return;
    }
    socket.emit('close_room', { roomId: room.value!.id, userId: userId });
}

export function kickPlayer(userId: string) {
    const roomId = room.value?.id;
    if (!roomId) {
        return;
    }
    socket.emit('kick_player', { roomId, userId });
}
