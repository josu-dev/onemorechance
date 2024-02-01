import { socket } from '$lib/ws.js';
import type { DeckIdentifier } from '$types';
import { writable } from 'svelte/store';
import type { ExposedReadable } from './types';


function createAvailableDecksStore(): ExposedReadable<DeckIdentifier[]> {
    let decks: DeckIdentifier[] = [];

    const { subscribe, set } = writable<DeckIdentifier[]>(decks);

    return {
        subscribe,
        get value() {
            return decks;
        },
        sync() {
            set(decks);
        },
        mset(value: DeckIdentifier[]) {
            decks = value;
            set(value);
        },
    };
}


export const availableDecks = createAvailableDecksStore();


socket.on('availible_decks_update', (data) => {
    availableDecks.mset(data);
});


export function updateAvailableDecks() {
    socket.emit('trigger_decks_update');
}
