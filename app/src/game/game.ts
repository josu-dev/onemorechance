import * as _game from '$game/stores/game.js';
import * as _player from '$game/stores/players.js';
import * as _room from '$game/stores/room.js';
import * as _self from '$game/stores/self.js';
import * as _shared from '$game/stores/shared.js';
import * as _socket from '$game/stores/socket.js';
import { user } from '$lib/stores/user.js';
import { log } from '$lib/utils/clientside.js';
import { ROOM_STATUS_CLIENT } from '$shared/constants.js';


export const socket = _socket.createSocketStore();

export const socketActions = _socket.createSocketActions(socket);

_socket.attachSocketListeners(socket);


export const self = _self.createSelfStore(user);

export const selfActions = _self.createSelfActions(socket, self);

_self.attachSelfListeners(socket, self);


export const players = _player.createPlayersStore(self);

export const playersActions = _player.createPlayersActions(socket, players);

_player.attachPlayersListeners(socket, players);


export const room = _room.createRoomStore();

export const roomActions = _room.createRoomActions(socket, self, room);

_room.attachRoomListeners(room, socket);

export const roomStatus = _room.createRoomStatusStore(room);


export const game = _game.createGameStore();

export const gameStatus = _game.createGameStatusStore(game);

export const gameActions = _game.createGameActions(socket, game);

_game.attachGameListeners(socket, game);


_shared.attachSharedListeners(socket, user, self, room, game, players);

socket.instance.on('connect_ready', () => {
    self.value.connected = true;
    self.sync();
    if (!self.value.loaded) {
        log.warn('User not loaded cannot auto connect');
        return;
    }

    if (room.value.status !== ROOM_STATUS_CLIENT.CONNECTING && room.value.status !== ROOM_STATUS_CLIENT.CONNECTION_LOST) {
        log.debug('Auto connecting to room cant connect to', room.value.status);
        return;
    }

    if (room.value.hostId === self.value.user.id) {
        roomActions.createRoom();
    } else {
        roomActions.joinRoom(room.value.id);
    }
});
