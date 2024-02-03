import type { Player, PlayersStore, SelfPlayer, SelfStore, SocketInstance } from '$game/types.client.js';
import { uniqueLettersId } from '$lib/utils';
import { writable } from 'svelte/store';


function defaultSelf(): SelfPlayer {
    return {
        registered: false,
        id: uniqueLettersId(),
        name: 'Not a player',
        socketId: '',
        role: 'GUEST',
        score: 0,
        totalScore: 0,
        ready: false,
        current: {
            modifier: '',
            option: [],
            freestyle: [],
        },
        stock: {
            options: [],
            modifiers: [],
        },
        used: {
            options: [],
            modifiers: [],
            freestyle: [],
        },
    };
}


export function createSelfStore(): SelfStore {
    let _self: SelfPlayer = defaultSelf();

    const { subscribe, set } = writable<SelfPlayer>(_self);

    return {
        subscribe,
        get value() {
            return _self;
        },
        sync() {
            set(_self);
        },
        mset(value: SelfPlayer) {
            _self = value;
            set(value);
        },
    };
}


export function createSelfActions(socket: SocketInstance, self: SelfStore) {
    return {
        register(name: string) {
            if (self.value.registered) {
                return;
            }
            socket.emit('user_register', { name: name });
        },
        unregister() {
            if (!self.value.registered) {
                return;
            }
            socket.emit('user_unregister', { id: self.value.id });
        },
    };
}


export function attachSelfListeners(socket: SocketInstance, self: SelfStore) {
    socket.on('user_registered', (data) => {
        self.value.registered = true;
        self.value.id = data.user.id;
        self.value.name = data.user.name;
        self.sync();
    });

    socket.on('user_unregistered', () => {
        self.mset(defaultSelf());
    });
}


function defaultPlayers(): Player[] {
    return [];
}


export function createPlayersStore(): PlayersStore {
    let _players: Player[] = defaultPlayers();

    const { subscribe, set } = writable<Player[]>(_players);

    return {
        subscribe,
        get value() {
            return _players;
        },
        sync() {
            set(_players);
        },
        mset(value: Player[]) {
            _players = value;
            set(value);
        },
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createPlayersActions(socket: SocketInstance, players: PlayersStore) {
    return {};
}

export function attachPlayersListeners(socket: SocketInstance, players: PlayersStore) {
    socket.on('player_joined', (data) => {
        let foundIndex = -1;
        for (let i = 0; i < players.value.length; i++) {
            if (players.value[i].id === data.player.id) {
                foundIndex = i;
                break;
            }
        }
        if (foundIndex === -1) {
            players.value.push(data.player);
        }
        else {
            players.value[foundIndex] = data.player;
        }
        players.sync();
    });

    socket.on('player_left', (data) => {
        let foundIndex = -1;
        for (let i = 0; i < players.value.length; i++) {
            if (players.value[i].id === data.playerId) {
                foundIndex = i;
                break;
            }
        }
        if (foundIndex === -1) {
            return;
        }
        players.value.splice(foundIndex, 1);
        players.sync();
    });

    socket.on('player_disconnected', (data) => {
        let foundIndex = -1;
        for (let i = 0; i < players.value.length; i++) {
            if (players.value[i].id === data.playerId) {
                foundIndex = i;
                break;
            }
        }
        if (foundIndex === -1) {
            return;
        }
        players.value.splice(foundIndex, 1);
        players.sync();
    });
}
