import { GAME } from '$lib/configs';
import { GAME_STATUS } from '$lib/enums';
import type { ExposedReadable } from '$lib/stores/types';
import type { DeckIdentifier, Game, Room, User } from '$types';
import { derived, writable } from 'svelte/store';


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

const INITIAL_GAME: Game = {
    id: 'b28yeb812ed',
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
    phrase: {
        id: '1',
        text: 'Nunca saldría con alguien que le guste {{}}',
    },
    usedPhrases: [],
    usedOptions: [],
    players: [
        {
            userId: '1',
            name: 'Josu',
            role: 'HOST',
            score: 0,
            totalScore: 0,
            ready: false,
            phrases: [],
            options: [],
            modifiers: [],
            selectedOption: undefined,
            freestyle: undefined,
        },
        {
            userId: '2',
            name: 'Mikel',
            role: 'INVITED',
            score: 0,
            totalScore: 0,
            ready: false,
            phrases: [],
            options: [],
            modifiers: [],
            selectedOption: undefined,
            freestyle: undefined,
        }
    ],
};

const INITIAL_ROOM: Room = {
    id: 'HJDNBH',
    status: 'LOBBY',
    host: INITIAL_USER,
    users: [INITIAL_USER, INITIAL_USER2],
    readyCount: 0,
    game: INITIAL_GAME,
};

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


function createUserStore(): ExposedReadable<User | undefined> {
    let _user: User | undefined = { ...INITIAL_USER };

    const { subscribe, set } = writable<User | undefined>(_user);

    return {
        get value() {
            return _user;
        },
        sync() {
            set(_user);
        },
        mset(user?: User) {
            _user = user;
            set(user);
        },
        subscribe,
    };
}


function createRoomStore(): ExposedReadable<Room | undefined> {
    let _room: Room | undefined = { ...INITIAL_ROOM };

    const { subscribe, set } = writable<Room | undefined>(_room);

    return {
        subscribe,
        get value() {
            return _room;
        },
        sync() {
            set(_room);
        },
        mset(room: Room) {
            _room = room;
            set(room);
        }
    };
}


function createGameStore(): ExposedReadable<Game> {
    let _game: Game = { ...INITIAL_GAME };

    const { subscribe, set } = writable<Game>(_game);

    room.subscribe((room) => {
        _game = room?.game || INITIAL_GAME;
        set(_game);
    });

    return {
        subscribe,
        get value() {
            return _game;
        },
        sync() {
            set(_game);
        },
        mset(game: Game) {
            _game = game;
            set(game);
        },
    };
}


export const user = createUserStore();

export const room = createRoomStore();

export const game = createGameStore();

export const players = derived(game, ($game) => {
    return $game.players;
}, []);

export const availibleDecks = writable<DeckIdentifier[]>(INITIAL_DECKS);


export function setGameStatus(status: Game['status']) {
    game.value.status = status;
    game.sync();
}
