import type { GameStateStore, Room, RoomClient, SocketStore } from '$game/types.js';
import { uniqueId } from '$lib/utils/index.js';
import { ROOM_STATUS_CLIENT } from '$shared/constants.js';
import { writable } from 'svelte/store';
import type { SelfStore } from './self.js';


export type RoomStore = GameStateStore<RoomClient>;

function defaultRoom(): RoomClient {
    return {
        id: uniqueId(),
        name: 'Not a room',
        status: ROOM_STATUS_CLIENT.NO_ROOM,
        hostId: '',
        maxPlayers: 0,
    };
}

export function createRoomStore(): RoomStore {
    let _room: RoomClient = defaultRoom();

    const { subscribe, set } = writable<RoomClient>(_room);

    return {
        subscribe,
        get value() {
            return _room;
        },
        mset(value) {
            if (_room !== value) {
                Object.assign(_room, value);
            }
            set(_room);
        },
        sync() {
            set(_room);
        },
        reset() {
            _room = defaultRoom();
            set(_room);
        }
    };
}

export function createRoomActions(socket: SocketStore, self: SelfStore, room: RoomStore) {
    return {
        createRoom() {
            if (!self.value.loaded || room.value.status !== ROOM_STATUS_CLIENT.NO_ROOM && room.value.status !== ROOM_STATUS_CLIENT.CONNECTING) {
                return;
            }

            socket.instance.emit('room_create', { roomId: room.value.id, user: self.value.user });
        },
        joinRoom(roomId: string) {
            if (!self.value.loaded || room.value.status !== ROOM_STATUS_CLIENT.NO_ROOM) {
                return;
            }

            socket.instance.emit('room_join', { roomId: roomId, user: self.value.user });

            room.value.status = ROOM_STATUS_CLIENT.CONNECTING;
            room.sync();
        },
        updateRoom(room: Room) {
            socket.instance.emit('room_update', { room: room });
        },
        closeRoom() {
            if (!self.value.loaded) {
                return;
            }

            socket.instance.emit('room_close', { roomId: room.value.id });
        },
        leaveRoom() {
            if (!self.value.loaded || room.value.status === ROOM_STATUS_CLIENT.NO_ROOM) {
                return;
            }

            socket.instance.emit('room_leave', { roomId: room.value.id });
        },
        setReady(ready: boolean = true) {
            socket.instance.emit(
                'player_set_ready',
                { roomId: room.value!.id, state: ready }
            );
        },
        kickPlayer(playerId: string) {
            socket.instance.emit(
                'room_kick_player',
                { roomId: room.value.id, playerId: playerId }
            );
        },
        startGame() {
            const hostId = room.value.hostId;
            const playerId = self.value.player.id;
            if (!hostId || hostId !== playerId) {
                return;
            }

            socket.instance.emit('game_start', { roomId: room.value.id });
        },
    };
}

export function attachRoomListeners(room: RoomStore, socket: SocketStore) {
    socket.instance.on('room_updated', (data) => {
        room.mset(data.room);
    });

    socket.instance.on('room_full', () => {
        room.value.status = ROOM_STATUS_CLIENT.FULL;
        room.sync();
    });
}
