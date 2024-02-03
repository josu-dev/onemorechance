import { writable } from 'svelte/store';
import type { ExposedReadable } from './types.js';


type User = {
    id: string,
    name: string,
};

type UserStore = ExposedReadable<{ id: string, name: string; } | undefined>;

export function createUserStore(): UserStore {
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
        mset(value: User | undefined) {
            _user = value;
            set(value);
        },
    };
}

export const user = createUserStore();
