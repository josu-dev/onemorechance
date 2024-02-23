/* eslint-disable @typescript-eslint/no-unused-vars */
import * as _game from '$game/stores/game.js';
import * as _player from '$game/stores/players.js';
import * as _room from '$game/stores/room.js';
import * as _self from '$game/stores/self.js';
import { createSocketStore } from '$game/stores/socket.js';
import type { Game, Player, RoomClient, User } from '$game/types.js';
import { user } from "$lib/stores/user.js";
import { GAME_STATUS, PLAYER_ROLE, ROOM_STATUS_CLIENT } from '$shared/constants.js';
import { GAME } from '$shared/defaults.js';


const INITIAL_USER: User = {
    id: '1',
    name: 'Josu',
    gamesPlayed: 0,
    gamesWon: 0,
    scoreLastGame: 0,
    scoreLifetime: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
};

const INITIAL_USER2: User = {
    id: '2',
    name: 'Mikel',
    gamesPlayed: 0,
    gamesWon: 0,
    scoreLastGame: 0,
    scoreLifetime: 0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
};

const INITIAL_ROOM: RoomClient = {
    id: 'HJDNBH',
    status: ROOM_STATUS_CLIENT.LOBBY_WAITING,
    hostId: INITIAL_USER.id,
    maxPlayers: GAME.MAX_PLAYERS
};

const INITIAL_GAME: Game = {
    id: 'b28yeb812ed',
    roomId: INITIAL_ROOM.id,
    status: GAME_STATUS.NOT_STARTED,
    settings: {
        deckId: "",
        fillTime: GAME.DEFAULT_FILL_TIME,
        rateTime: GAME.DEFAULT_RATE_TIME,
        players: GAME.DEFAULT_PLAYERS,
        rounds: GAME.DEFAULT_ROUNDS,
        options: GAME.DEFAULT_OPTIONS,
    },
    round: 0,
    deck: {
        id: '2',
        name: 'Refranes inventados',
        type: 'COMPLETE',
    },
    current: {
        sentence: {
            id: '1',
            // text: 'Nunca saldría con {{1}}',
            text: 'Nunca saldría con {{1}} porque no da que le guste {{2}} deah',
        },
        winner: INITIAL_USER.id
    },
    used: {
        sentences: [],
        options: [],
    },
};

const INITIAL_PLAYERS: Player[] = [
    {
        id: '1',
        host: true,
        name: 'Josu',
        role: PLAYER_ROLE.HOST,
        score: 40,
        scoreLast: 40,
        scoreTotal: 80,
        ready: false,
        current: {
            option: undefined,
            modifier: undefined,
            freestyle: ['juana', 'chupar pies de vagabundos'],
        },
        stock: {
            options: [],
            modifiers: [],
        },
        used: {
            freestyle: [],
            options: [],
            modifiers: [],
        },
        ratesReceived: {}
    },
    {
        id: '2',
        host: false,
        name: 'Mikel',
        role: PLAYER_ROLE.GUEST,
        score: -30,
        scoreLast: 60,
        scoreTotal: 30,
        ready: false,
        current: {
            option: undefined,
            modifier: undefined,
            freestyle: ['un perro']
        },
        stock: {
            options: [],
            modifiers: [],
        },
        used: {
            freestyle: [],
            options: [],
            modifiers: [],
        },
        ratesReceived: {}
    },
    {
        id: '3',
        host: false,
        name: 'Ander',
        role: PLAYER_ROLE.GUEST,
        score: 0,
        scoreLast: 50,
        scoreTotal: 50,
        ready: false,
        current: {
            option: undefined,
            modifier: undefined,
            freestyle: ['la mascota de la vecina', 'comerme las uñas de los pies']
        },
        stock: {
            options: [],
            modifiers: [],
        },
        used: {
            freestyle: [],
            options: [],
            modifiers: [],
        },
        ratesReceived: {}
    }
];


export const socket = createSocketStore();


export const self = _self.createSelfStore(user);

export const selfActions = _self.createSelfActions(socket, self);

_self.attachSelfListeners(socket, self);

self.value.player.id = INITIAL_USER.id;
self.value.loaded = true;
self.value.player.role = PLAYER_ROLE.HOST;
self.sync();

export const players = _player.createPlayersStore(self);

export const playersActions = _player.createPlayersActions(socket, players);

_player.attachPlayersListeners(socket, players);

players.mset(INITIAL_PLAYERS);

export const room = _room.createRoomStore();

export const roomActions = _room.createRoomActions(socket, self, room);

_room.attachRoomListeners(room, socket);

export const roomStatus = _room.createRoomStatusStore(room);

room.mset(INITIAL_ROOM);

export const game = _game.createGameStore();

export const gameStatus = _game.createGameStatusStore(game);

export const gameActions = _game.createGameActions(socket, game);

_game.attachGameListeners(socket, game);

game.mset(INITIAL_GAME);
