import { socket } from '$lib/ws.js';
import type { User } from '$types';
import { writable } from 'svelte/store';


function createUserStore() {
    let _user: User | undefined = undefined;
    const { subscribe, set } = writable<User | undefined>(undefined);

    return {
        init(user: User | undefined) {
            _user = user;
            set(user);
        },
        get peek() {
            return _user;
        },
        subscribe,
    };
}

export const user = createUserStore();


socket.on('registered', (data) => {
    user.init(data);
});

socket.on('unregistered', () => {
    console.info('unregistered');
    user.init(undefined);
});
