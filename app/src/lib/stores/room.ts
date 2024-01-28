import { goto } from '$app/navigation';
import { socket } from '$lib/ws';
import type { Room, User } from '$types';
import { derived, writable } from 'svelte/store';
import { user } from './user';


function createRoomStore() {
    let _room: Room | undefined;
    const { subscribe, set } = writable<Room | undefined>(undefined);

    function addUser(user: User) {
        _room?.users.push(user);
        set(_room);
    }

    return {
        init(room: Room) {
            _room = room;
            set(room);
        },
        get peek() {
            return _room;
        },
        subscribe,
        addUser: addUser,
    };
}

export const room = createRoomStore();

export const roomUsers = derived([room], ([$roomStore], set) => {
    if (!$roomStore) {
        return;
    }

    set($roomStore.users);
}, [] as User[]);


socket.on('created_room', (data) => {
    room.init(data);

    goto(`/${data.id}`);
});

socket.on('joined_room', (data) => {
    room.init(data);

    goto(`/${data.id}`);
});

socket.on('user_joined_room', (data) => {
    if (user.peek?.id !== data.id) {
        room.addUser(data);
    }
});

socket.on('game_started', (data) => {
    room.peek!.game = data;
    socket.emit('get_new_round', { roomId: room.peek!.id, userId: user.peek!.id, options: room.peek!.game.maxOptions });
});

export function updateRoom(room: Room) {
    socket.emit('update_room', { roomId: room.id, data: room });
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
