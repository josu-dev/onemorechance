import type { DeckIdentifier } from '$game/types.js';
import { DECK_TYPE } from '$shared/constants.js';
import { writable } from 'svelte/store';
import type { ExposedReadable } from './types.ts';


export type DecksStore = ExposedReadable<DeckIdentifier[]>;

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
    let _decks: DeckIdentifier[] = defaultDecks();

    const { subscribe, set } = writable<DeckIdentifier[]>(_decks);

    return {
        subscribe,
        get value() {
            return _decks;
        },
        mset(value) {
            _decks = value;
            set(_decks);
        },
        sync() {
            set(_decks);
        },
    };
}

export const decks = createDecksStore();
