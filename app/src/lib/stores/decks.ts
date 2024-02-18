import type { DeckIdentifier } from '$game/types.js';
import { log } from '$lib/utils/logging.ts';
import { writable } from 'svelte/store';
import type { ExposedReadable } from './types.ts';


export type Deck = DeckIdentifier & {
    sentencesCount: number;
};

export type DecksStore = ExposedReadable<Deck[]> & {
    refresh: () => void;
};

function defaultDecks(): Deck[] {
    return [];
}

export function createDecksStore(): DecksStore {
    let _decks: Deck[] = defaultDecks();

    const { subscribe, set } = writable(_decks);

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
        refresh() {
            fetch('/api/v1/decks?page=1&limit=100')
                .then((res) => {
                    if (!res.ok) {
                        return [];
                    }
                    return res.json();
                })
                .then((data) => {
                    _decks = data;
                    set(_decks);
                })
                .catch((e) => {
                    log.error('Failed to fetch decks', e);
                });
        }
    };
}

export const decks = createDecksStore();
