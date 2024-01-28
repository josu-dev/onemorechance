import { socket } from '$lib/ws';
import type { DeckIdentifier } from '$types';
import { writable } from 'svelte/store';


function createAvailableDecksStore() {
    let decks: DeckIdentifier[] = [];
    const { subscribe, set } = writable<DeckIdentifier[]>(decks);

    function _set(data: DeckIdentifier[]) {
        decks = data.map((deck) => {
            return {
                id: deck.id,
                name: deck.name,
                type: deck.type,
            };
        });
        set(decks);
    }

    return {
        subscribe,
        set: _set,
        get peek() {
            return decks;
        },
    };
}

export const availableDecks = createAvailableDecksStore();


socket.on('availible_decks_update', (data) => {
    availableDecks.set(data);
});


export function updateAvailableDecks() {
    socket.emit('trigger_decks_update');
}
