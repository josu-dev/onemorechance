/* eslint-disable @typescript-eslint/no-unused-vars */
import { GAME } from '$game/configs';
import { GAME_STATUS } from '$game/enums';
import { createSocket } from '$game/socket';
import * as _decks from '$game/stores/decks';
import * as _game from '$game/stores/game';
import * as _player from '$game/stores/player';
import * as _room from '$game/stores/room';
import type { DeckIdentifier, User } from '$game/types';
import type { Game, Player, Room } from '$game/types.client';


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

const INITIAL_ROOM: Room = {
    id: 'HJDNBH',
    status: 'IN_LOBBY',
    hostId: INITIAL_USER.id,
    maxPlayers: GAME.MAX_PLAYERS
};

const INITIAL_GAME: Game = {
    id: 'b28yeb812ed',
    roomId: INITIAL_ROOM.id,
    status: GAME_STATUS.NOT_STARTED,
    maxRounds: GAME.DEFAULT_ROUNDS,
    maxOptions: GAME.DEFAULT_OPTIONS,
    chooseTime: GAME.DEFAULT_SELECTION_TIME,
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
        score: 0,
        totalScore: 0,
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
    },
    {
        id: '2',
        name: 'Mikel',
        role: 'GUEST',
        score: 0,
        totalScore: 0,
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
    }
];

const INITIAL_DECKS: DeckIdentifier[] = [
    {
        id: "1",
        type: "CHOOSE",
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

self.value.registered=true

export const players = _player.createPlayersStore();

export const playersActions = _player.createPlayersActions(socket, players);

_player.attachPlayersListeners(socket, players);

players.mset(INITIAL_PLAYERS)

export const room = _room.createRoomStore();

export const roomActions = _room.createRoomActions(socket, self, room);

_room.attachRoomListeners(room, socket);

room.mset(INITIAL_ROOM)

export const game = _game.createGameStore();

export const gameStatus = _game.createGameStatusStore(game);

export const gameActions = _game.createGameActions(socket, self, game);

_game.attachGameListeners(socket, game);

game.mset(INITIAL_GAME)

export const decks = _decks.createDecksStore();

export const decksActions = _decks.createDecksActions(socket, decks);

_decks.attachDecksListeners(socket, decks);

decks.mset(INITIAL_DECKS)

// TODO: attach common listeners between stores
