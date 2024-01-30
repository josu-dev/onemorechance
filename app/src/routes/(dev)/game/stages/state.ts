import { GAME } from '$lib/configs';
import { GAME_STATUS } from '$lib/enums';
import type { Game, Room, User } from '$types';
import { derived, writable, type Readable, type Writable } from 'svelte/store';


/** Readable with its value exposed. */
export interface ExposedReadable<T> extends Readable<T> {
    /**
     * Exposed value.
     */
    get value(): T;

    /**
     * Manually sync the value with the store to trigger updates.
     */
    sync(): void;
}

/** Writable with its value exposed. */
export interface ExposedWritable<T> extends Writable<T> {
    /**
     * Exposed value.
     */
    get value(): T;

    /**
     * Manually sync the value with the store to trigger updates.
     */
    sync(): void;
}


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
        name: 'No me acuerdo',
        type: 'COMPLETE',
    },
    phrase: {
        id: '1',
        text: '2313123123123',
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


function createUserStore(): ExposedWritable<User | undefined> {
    let _user: User | undefined = { ...INITIAL_USER };
    const { subscribe, set, update } = writable<User | undefined>(_user);

    return {
        get value() {
            return _user;
        },
        sync() {
            set(_user);
        },
        set(user?: User) {
            _user = user;
            set(user);
        },
        subscribe,
        update,
    };
}

function createRoomStore(): ExposedWritable<Room | undefined> {
    let _room: Room | undefined = { ...INITIAL_ROOM };

    const { subscribe, set, update } = writable<Room | undefined>(_room);

    return {
        get value() {
            return _room;
        },
        sync() {
            set(_room);
        },
        subscribe,
        set(room: Room) {
            _room = room;
            set(room);
        },
        update
    };
}

function createGameStore(): ExposedWritable<Game> {
    let _game: Game = { ...INITIAL_GAME };

    const { subscribe, set, update } = writable<Game>(_game);

    room.subscribe((room) => {
        _game = room?.game || INITIAL_GAME;
        set(_game);
    });

    return {
        get value() {
            return _game;
        },
        sync() {
            set(_game);
        },
        subscribe,
        set(game: Game) {
            _game = game;
            set(game);
        },
        update,
    };
}


export const user = createUserStore();

export const room = createRoomStore();

export const game = createGameStore();

export const players = derived(game, ($game) => {
    return $game.players;
}, []);


export function setGameStatus(status: Game['status']) {
    game.value.status = status;
    game.sync();
}
