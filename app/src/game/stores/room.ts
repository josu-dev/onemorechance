import { goto } from '$app/navigation';
import { ROOM_STATUS } from '$game/enums';
import type { Room, RoomStore, SelfStore, SocketInstance } from '$game/types.client.js';
import { uniqueLettersId } from '$lib/utils';
import { writable } from 'svelte/store';


function defaultRoom(): Room {
    return {
        id: uniqueLettersId(),
        name: 'Not a room',
        status: ROOM_STATUS.NO_ROOM,
        hostId: '',
        maxPlayers: 0,
    };
}


export function createRoomStore(): RoomStore {
    let _room: Room = defaultRoom();

    const { subscribe, set } = writable<Room>(_room);

    return {
        subscribe,
        get value() {
            return _room;
        },
        sync() {
            set(_room);
        },
        mset(value: Room) {
            _room = value;
            set(value);
        },
    };
}


export function createRoomActions(socket: SocketInstance, self: SelfStore, room: RoomStore) {
    return {
        createRoom() {
            if (!self.value.registered) {
                return;
            }
            socket.emit('create_room', { userId: self.value.id });
        },
        updateRoom(room: Room) {
            socket.emit('update_room', { roomId: room.id, data: room });
        },
        closeRoom() {
            if (!self.value.registered) {
                return;
            }
            socket.emit('close_room', { roomId: room.value!.id, userId: self.value.id });
        },
        joinRoom(roomId: string) {
            if (!self.value.registered) {
                return;
            }
            socket.emit('join_room', { roomId: roomId, userId: self.value.id });
        },
        leaveRoom() {
            if (!self.value.registered || room.value.status === ROOM_STATUS.NO_ROOM) {
                return;
            }
            socket.emit('leave_room', { roomId: room.value!.id, userId: self.value.id });
        },
        setDeck(deckId: string) {
            if (!room.value) {
                return;
            }

            socket.emit('update_room_deck', { roomId: room.value.id, deckId: deckId });
        },
        setReady(ready?: boolean) {
            socket.emit(
                ready ? 'player_ready' : 'player_unready',
                { roomId: room.value!.id, userId: self.value.id }
            );
        },
        kickPlayer(userId: string) {
            const roomId = room.value?.id;
            if (!roomId) {
                return;
            }
            socket.emit('kick_player', { roomId, userId });
        },
        startGame() {
            const hostId = room.value.hostId;
            const playerId = self.value.id;
            if (!hostId || hostId !== playerId) {
                return;
            }
            socket.emit('start_game', { roomId: room.value!.id, userId: playerId });
        },
    };
}


export function attachRoomListeners(room: RoomStore, socket: SocketInstance) {
    socket.on('room_create', (data) => {
        room.mset(data);

        goto(`/${data.id}`);
    });

    socket.on('room_create', (data) => {
        room.mset(data);
    });

    socket.on('room_join', (data) => {
        room.mset(data);

        goto(`/${data.id}`);
    });

    // socket.on('player_join', ({player}) => {
    //     const r = room.value;
    //     if (!r || user.value?.id === player.id) {
    //         return;
    //     }

    //     r.
    //     room.mset(r);
    // });
}
