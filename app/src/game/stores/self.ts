import type { GameStateStore, Player, SocketStore, User } from '$game/types.js';
import type { UserStore } from '$lib/stores/user.ts';
import { PLAYER_ROLE } from '$shared/constants.js';
import { writable } from 'svelte/store';


export type Self = {
    connected: boolean;
    loaded: boolean;
    player: Player;
    user: User;
};

export type SelfStore = GameStateStore<Self>;


function defaultSelf(): Self {
    return {
        connected: false,
        loaded: false,
        player: {
            id: '',
            host: false,
            name: 'Default Player',
            role: PLAYER_ROLE.GUEST,
            score: 0,
            scoreLast: 0,
            scoreTotal: 0,
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
            ratesReceived: {},
        },
        user: {
            id: '',
            name: 'Default User',
            createdAt: 0,
            updatedAt: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            scoreLastGame: 0,
            scoreLifetime: 0,
        }
    };
}


export function createSelfStore(user: UserStore): SelfStore {
    const _self: Self = defaultSelf();

    const { subscribe, set } = writable<Self>(_self);

    user.subscribe((value) => {
        if (value) {
            _self.loaded = true;
            _self.user = value;
        }
        else {
            _self.loaded = false;
            _self.user = defaultSelf().user;
        }
    });

    return {
        subscribe,
        get value() {
            return _self;
        },
        mset(value) {
            if (value !== _self) {
                Object.assign(_self, value);
            }
            set(_self);
        },
        sync() {
            set(_self);
        },
        reset() {
            _self.connected = false;
            const _default = defaultSelf();
            _self.player = _default.player;
            if (user.value) {
                _self.loaded = true;
                _self.user = user.value;
            }
            else {
                _self.loaded = false;
                _self.user = _default.user;
            }
            set(_self);
        },
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createSelfActions(socket: SocketStore, self: SelfStore) {
    return {
        // register(user: User) {
        //     if (self.value.loaded) {
        //         return;
        //     }
        //     socket.instance.emit('user_register', { user });
        // },
        // unregister() {
        //     if (!self.value.loaded) {
        //         return;
        //     }
        //     socket.instance.emit('user_unregister', { id: self.value.player.id });
        // },
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function attachSelfListeners(socket: SocketStore, self: SelfStore) {
    // socket.instance.on('user_registered', (data) => {
    //     self.value.loaded = true;
    //     self.value.player = data.user;
    //     self.sync();
    // });

    // socket.instance.on('user_unregistered', () => {
    //     self.mset(defaultSelf());
    // });
}
