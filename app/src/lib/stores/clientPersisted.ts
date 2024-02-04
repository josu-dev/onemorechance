import { writable } from 'svelte/store';
import type { LocalPersistedStore } from './types.js';


const browser = typeof (window) !== 'undefined' && typeof (document) !== 'undefined';

function saveValue<T>(key: string, value: T, storage: Storage) {
    try {
        storage.setItem(key, JSON.stringify(value));
    }
    catch (error) {
        console.error('Error saving to user storage', error);
    }
}

function parseValue<T>(value: string | null, fallback: T): T {
    if (value === null) {
        return fallback;
    }
    
    try {
        return JSON.parse(value);
    }
    catch (error) {
        console.error('Error parsing user storage', error);
        return fallback;
    }
}

const registeredStores = new Map<string, LocalPersistedStore<any>>();

export function localPersisted<T>(key: string, fallback: T): LocalPersistedStore<T> {
    if (registeredStores.has(key)) {
        return registeredStores.get(key) as LocalPersistedStore<T>;
    }

    const fallbackValue = structuredClone(fallback);

    if (!browser) {
        const store: LocalPersistedStore<T> = {
            ...writable(fallbackValue),
            get: () => fallbackValue,
            reset: () => { },
        };
        registeredStores.set(key, store);
        return store;
    }

    let _value = parseValue(localStorage.getItem(key), fallbackValue);

    const { subscribe, set } = writable(_value);

    const store: LocalPersistedStore<T> = {
        subscribe,
        set: (value) => {
            _value = value;
            saveValue(key, _value, localStorage);
            set(_value);
        },
        update: (fn) => {
            _value = fn(_value);
            saveValue(key, _value, localStorage);
            set(_value);
        },
        get: () => {
            return _value;
        },
        reset: () => {
            _value = fallbackValue;
            saveValue(key, _value, localStorage);
            set(_value);
        },
    };

    registeredStores.set(key, store);

    return store;
}
