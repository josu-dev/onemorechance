import { socket } from '$lib/ws.js';
import type { User } from '$types';
import { writable } from 'svelte/store';
import type { ExposedReadable } from './types';


function createUserStore(): ExposedReadable<User | undefined> {
    let _user: User | undefined = undefined;

    const { subscribe, set } = writable<User | undefined>(_user);

    return {
        subscribe,
        get value() {
            return _user;
        },
        sync() {
            set(_user);
        },
        mset(value?: User) {
            _user = value;
            set(value);
        },
    };
}


export const user = createUserStore();


socket.on('registered', (data) => {
    user.mset(data);
});

socket.on('unregistered', () => {
    user.mset(undefined);
});
