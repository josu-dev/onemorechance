import type { User } from '$shared/types.js';
import { writable } from 'svelte/store';
import type { ExposedReadable } from './types.js';


export type UserStore = ExposedReadable<User | undefined>;

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
        mset(value) {
            _user = value;
            set(value);
        },
    };
}

export const user = createUserStore();
