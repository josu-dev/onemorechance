import { ROOM_STATUS } from '$game/enums.js';
import type { Room, RoomStore, SelfStore, SocketInstance } from '$game/types.client.js';
import { uniqueLettersId } from '$lib/utils/index.js';
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
            socket.emit('room_create', {});
        },
        updateRoom(room: Room) {
            socket.emit('room_update', { room: room });
        },
        closeRoom() {
            if (!self.value.registered) {
                return;
            }
            socket.emit('room_close', { roomId: room.value.id });
        },
        joinRoom(roomId: string) {
            if (!self.value.registered) {
                return;
            }

            room.value.status = ROOM_STATUS.CONNECTING;
            room.sync();

            socket.emit('room_join', { roomId: roomId });
        },
        leaveRoom() {
            if (!self.value.registered || room.value.status === ROOM_STATUS.NO_ROOM) {
                return;
            }
            socket.emit('room_leave', { roomId: room.value.id });
        },
        setReady(ready: boolean = true) {
            socket.emit(
                'player_set_ready',
                { roomId: room.value!.id, state: ready }
            );
        },
        kickPlayer(playerId: string) {
            socket.emit(
                'room_kick_player',
                { roomId: room.value.id, playerId: playerId }
            );
        },
        startGame() {
            const hostId = room.value.hostId;
            const playerId = self.value.id;
            if (!hostId || hostId !== playerId) {
                return;
            }
            socket.emit('game_start', { roomId: room.value.id });
        },
    };
}


export function attachRoomListeners(room: RoomStore, socket: SocketInstance) {
    socket.on('room_updated', (data) => {
        room.mset(data.room);
    });

    socket.on('room_full', (data) => {
        console.debug(`room_full: ${room.value.id} maxPlayers: ${data.maxPlayers}`);
        room.value.status = ROOM_STATUS.FULL;
        room.sync();
    });
}
