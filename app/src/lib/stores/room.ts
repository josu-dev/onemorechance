import type { Room } from '$lib/server/rooms';
import { derived, writable } from 'svelte/store';
import { socket } from '$lib/ws';
import type { User } from '$lib/server/users';
import { goto } from '$app/navigation';
import { user } from './user';


function createRoomStore() {
    let _room: Room | undefined;
    const { subscribe, set, update } = writable<Room | undefined>(undefined);

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

export const roomUsers = derived([room], ([$roomStore], set, update) => {
    console.log('roomUsers', $roomStore);
    if (!$roomStore) {
        return;
    }

    set($roomStore.players);
}, [] as User[]);


socket.on('created_room', (data) => {
    console.log('[ws:created_room]', data);
    room.init(data);

    goto(`/${data.id}`);
});

console.log('room', room);

socket.on('joined_room', (data) => {
    console.log('[ws:joined_data]', data);
    room.init(data);
    goto(`/${data.id}`);
})

socket.on('user_joined_room', (data) => {
    console.log('[ws:user_joined_room]', data);
    if (user.peek?.id !== data.id) {
        room.addPlayer(data);
    }
});
