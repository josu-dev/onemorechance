import { DECK_TYPE } from '$game/enums';
import type { DeckIdentifier } from '$game/types';
import type { DecksStore, SocketInstance } from '$game/types.client';
import { writable } from 'svelte/store';


function defaultDecks(): DeckIdentifier[] {
    return [
        {
            id: "1",
            name: "Humor negro",
            type: DECK_TYPE.CHOOSE,
            description: "Ni que fueras tan gracioso"
        },
        {
            id: "2",
            name: "Refranes inventados",
            type: DECK_TYPE.COMPLETE,
            description: 'Pone a prueba tu creatividad'
        },
        {
            id: "3",
            name: "Family friendly",
            type: DECK_TYPE.COMPLETE,
            description: 'Todos podemos jugar juntos'
        }
    ];
}


export function createDecksStore(): DecksStore {
    let decks: DeckIdentifier[] = defaultDecks();

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


export function createDecksActions(decks: DecksStore, socket: SocketInstance) {
    return {
        updateDecks() {
            socket.emit('trigger_decks_update');
        },
    };
}

export function attachDecksListeners(decks: DecksStore, socket: SocketInstance) {
    socket.on('availible_decks_update', (data: DeckIdentifier[]) => {
        decks.mset(data);
    });
}
