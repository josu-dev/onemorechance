/* eslint-disable @typescript-eslint/no-unused-vars */
import { createSocket } from '$game/socket';
import * as _decks from '$game/stores/decks';
import * as _game from '$game/stores/game';
import * as _player from '$game/stores/player';
import * as _room from '$game/stores/room';
import type { DeckIdentifier, Game, Player, RoomClient, User } from '$game/types';
import { GAME } from '$shared/configs.js';
import { GAME_STATUS, PLAYER_ROLE } from '$shared/constants.js';


const INITIAL_USER: User = {
    id: '1',
    name: 'Josu',
    socketId: 'undefined',
};

const INITIAL_USER2: User = {
    id: '2',
    name: 'Mikel',
    socketId: 'undefined',
};

const INITIAL_ROOM: RoomClient = {
    id: 'HJDNBH',
    status: 'WAITING',
    hostId: INITIAL_USER.id,
    maxPlayers: GAME.MAX_PLAYERS
};

const INITIAL_GAME: Game = {
    id: 'b28yeb812ed',
    roomId: INITIAL_ROOM.id,
    status: GAME_STATUS.NOT_STARTED,
    settings: {
        deckId: GAME.DEFAULT_DECK_ID,
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
        phrase: {
            id: '1',
            text: 'Nunca saldría con alguien que le guste {{}}',
        },
        winner: INITIAL_USER.id,
    },
    used: {
        phrases: [],
        options: [],
    },
};

const INITIAL_PLAYERS: Player[] = [
    {
        id: '1',
        name: 'Josu',
        role: 'HOST',
        score: 40,
        scoreLast: 40,
        scoreTotal: 80,
        ready: false,
        current: {
            option: undefined,
            modifier: undefined,
            freestyle: undefined,
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
        name: 'Mikel',
        role: 'GUEST',
        score: -30,
        scoreLast: 60,
        scoreTotal: 30,
        ready: false,
        current: {
            option: undefined,
            modifier: undefined,
            freestyle: undefined,
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
        name: 'Ander',
        role: 'GUEST',
        score: 0,
        scoreLast: 50,
        scoreTotal: 50,
        ready: false,
        current: {
            option: undefined,
            modifier: undefined,
            freestyle: undefined,
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

const INITIAL_DECKS: DeckIdentifier[] = [
    {
        id: "1",
        type: "SELECT",
        name: "Humor negro",
        description: "Completa con lo que te atrevas"
    },
    {
        id: "2",
        type: "COMPLETE",
        name: "Refranes inventados",
        description: "Sos bueno para darle sentido?"
    },
    {
        id: "3",
        type: "COMPLETE",
        name: "Family friendly",
        description: "Apto para la familia"
    }
];


export const socket = createSocket();


export const self = _player.createSelfStore();

export const selfActions = _player.createSelfActions(socket, self);

_player.attachSelfListeners(socket, self);

self.value.id = INITIAL_USER.id;
self.value.registered = true;
self.value.role = PLAYER_ROLE.HOST;

export const players = _player.createPlayersStore();

export const playersActions = _player.createPlayersActions(socket, players);

_player.attachPlayersListeners(socket, players);

players.mset(INITIAL_PLAYERS);

export const room = _room.createRoomStore();

export const roomActions = _room.createRoomActions(socket, self, room);

_room.attachRoomListeners(room, socket);

room.mset(INITIAL_ROOM);

export const game = _game.createGameStore();

export const gameStatus = _game.createGameStatusStore(game);

export const gameActions = _game.createGameActions(socket, self, game);

_game.attachGameListeners(socket, game);

game.mset(INITIAL_GAME);

export const decks = _decks.createDecksStore();

export const decksActions = _decks.createDecksActions(socket, decks);

_decks.attachDecksListeners(socket, decks);

decks.mset(INITIAL_DECKS);

// TODO: attach common listeners between stores
