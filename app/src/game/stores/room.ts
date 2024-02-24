import type { GameStateStore, RoomClient, RoomStatusClient, SelfStore, SocketStore } from '$game/types.js';
import type { Readable } from '$lib/stores/types.ts';
import { uniqueId } from '$lib/utils/index.js';
import { log } from '$lib/utils/clientside.js';
import { ROOM_STATUS_CLIENT } from '$shared/constants.js';
import { derived, writable } from 'svelte/store';


export type RoomStore = GameStateStore<RoomClient>;

function defaultRoom(): RoomClient {
    return {
        id: uniqueId(),
        name: 'Not loaded',
        status: ROOM_STATUS_CLIENT.NO_LOADED,
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
            if (!self.value.loaded) {
                log.debug('createRoom failed', 'self.value.loaded', self.value.loaded, 'room.value.status', room.value.status);
                return;
            }

            log.debug('createRoom', 'roomId', room.value.id, 'userId', self.value.user.id);
            socket.instance.emit('room_create', { roomId: room.value.id, userId: self.value.user.id });
        },
        joinRoom(roomId: string) {
            if (!self.value.loaded) {
                log.debug('joinRoom failed', 'self.value.loaded', self.value.loaded, 'room.value.status', room.value.status);
                return;
            }

            socket.instance.emit('room_join', { roomId: roomId, userId: self.value.user.id });

            room.value.status = ROOM_STATUS_CLIENT.CONNECTING;
            room.sync();
        },
        closeRoom() {
            socket.instance.emit('room_close', { roomId: room.value.id });
        },
        leaveRoom() {
            if (!self.value.loaded || room.value.status === ROOM_STATUS_CLIENT.NO_LOADED) {
                log.debug('leaveRoom failed', 'self.value.loaded', self.value.loaded, 'room.value.status', room.value.status);
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
                log.debug('startGame failed (not host)', 'hostId', hostId, 'playerId', playerId);
                return;
            }

            socket.instance.emit('room_start_game', { roomId: room.value.id });
        },
    };
}

export function attachRoomListeners(room: RoomStore, socket: SocketStore) {
    socket.instance.on('room_updated', (data) => {
        log.debug('room_updated', data);
        room.mset(data.room);
    });

    socket.instance.on('room_full', () => {
        log.debug('room_full');
        room.value.status = ROOM_STATUS_CLIENT.FULL;
        room.sync();
    });
}

type RoomStatusState = {
    value: RoomStatusClient;
    isClosed: boolean;
    isConnecting: boolean;
    isConnectionLost: boolean;
    isFull: boolean;
    isGameActive: boolean;
    isInLobby: boolean;
    isKicked: boolean;
    isNotLoaded: boolean;
    isNotFound: boolean;
    isRoomLeft: boolean;
};

export function createRoomStatusStore(room: RoomStore): Readable<RoomStatusState> {
    const _state: RoomStatusState = {
        value: ROOM_STATUS_CLIENT.NO_LOADED,
        isClosed: false,
        isConnecting: false,
        isConnectionLost: false,
        isFull: false,
        isGameActive: false,
        isInLobby: false,
        isKicked: false,
        isNotFound: false,
        isNotLoaded: true,
        isRoomLeft: false,
    };

    const statusStore = derived(
        room,
        ($room, set) => {
            if (_state.value === $room.status) {
                return;
            }

            _state.value = $room.status;
            _state.isClosed = $room.status === ROOM_STATUS_CLIENT.CLOSED;
            _state.isConnecting = $room.status === ROOM_STATUS_CLIENT.CONNECTING;
            _state.isConnectionLost = $room.status === ROOM_STATUS_CLIENT.CONNECTION_LOST;
            _state.isFull = $room.status === ROOM_STATUS_CLIENT.FULL;
            _state.isGameActive = $room.status === ROOM_STATUS_CLIENT.GAME_ACTIVE;
            _state.isInLobby = $room.status === ROOM_STATUS_CLIENT.LOBBY_WAITING;
            _state.isKicked = $room.status === ROOM_STATUS_CLIENT.KICKED;
            _state.isNotFound = $room.status === ROOM_STATUS_CLIENT.NOT_FOUND;
            _state.isNotLoaded = $room.status === ROOM_STATUS_CLIENT.NO_LOADED;
            _state.isRoomLeft = $room.status === ROOM_STATUS_CLIENT.LEFT;
            set(_state);
        },
        _state
    );

    return statusStore;
}
