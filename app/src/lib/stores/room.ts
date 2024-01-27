import { goto } from '$app/navigation';
import { socket } from '$lib/ws';
import type { Room, User } from '$types';
import { derived, writable } from 'svelte/store';
import { user } from './user';


function createRoomStore() {
    let _room: Room | undefined;
    const { subscribe, set } = writable<Room | undefined>(undefined);

    function addPlayer(user: User) {
        _room?.players.push(user);
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
        addPlayer: addPlayer,
    };
}

export const room = createRoomStore();

export const roomUsers = derived([room], ([$roomStore], set) => {
    if (!$roomStore) {
        return;
    }

    set($roomStore.players);
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
        room.addPlayer(data);
    }
});
