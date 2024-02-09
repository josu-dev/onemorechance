import * as _socket from '$game/socket.js';
import * as _decks from '$game/stores/decks.js';
import * as _game from '$game/stores/game.js';
import * as _player from '$game/stores/player.js';
import * as _room from '$game/stores/room.js';
import * as _shared from '$game/stores/shared.js';


export const socket = _socket.createSocket();

export const socketActions = _socket.createSocketActions(socket);

_socket.attachSocketListeners(socket);


export const self = _player.createSelfStore();

export const selfActions = _player.createSelfActions(socket, self);

_player.attachSelfListeners(socket, self);


export const players = _player.createPlayersStore();

export const playersActions = _player.createPlayersActions(socket, players);

_player.attachPlayersListeners(socket, players);



export const room = _room.createRoomStore();

export const roomActions = _room.createRoomActions(socket, self, room);

_room.attachRoomListeners(room, socket);


export const game = _game.createGameStore();

export const gameStatus = _game.createGameStatusStore(game);

export const gameActions = _game.createGameActions(socket, self, game);

_game.attachGameListeners(socket, game);


export const decks = _decks.createDecksStore();

export const decksActions = _decks.createDecksActions(socket, decks);

_decks.attachDecksListeners(socket, decks);


_shared.attachSharedListeners(socket, self, room, game, players);