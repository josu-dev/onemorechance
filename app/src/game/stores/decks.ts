import type { DeckIdentifier, DecksStore, SocketInstance } from '$game/types.js';
import { DECK_TYPE } from '$shared/constants.js';
import { writable } from 'svelte/store';


function defaultDecks(): DeckIdentifier[] {
    return [
        {
            id: "1",
            name: "Humor negro",
            type: DECK_TYPE.SELECT,
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createDecksActions(socket: SocketInstance, decks: DecksStore) {
    return {
    };
}

export function attachDecksListeners(socket: SocketInstance, decks: DecksStore) {
    socket.on('decks_update', (data) => {
        decks.mset(data.decks);
    });
}
