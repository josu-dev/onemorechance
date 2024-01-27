import type { User } from '$lib/server/users';
import { writable } from 'svelte/store';
import { socket } from '$lib/ws';


function createUserStore() {
    let _user: User | undefined = undefined;
    const { subscribe, set, update } = writable<User | undefined>(undefined);

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
    console.log('[ws:registered]', data);
    user.init(data);
})
