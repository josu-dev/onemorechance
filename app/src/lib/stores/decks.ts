import { browser } from '$app/environment';
import type { DeckIdentifier } from '$game/types.js';
import { log } from '$lib/utils/clientside.js';
import { writable } from 'svelte/store';
import type { ExposedReadable } from './types.js';


export type DeckState = (
    DeckIdentifier & {
        sentencesCount: number;
    }
)[];

export type DecksStore = ExposedReadable<DeckState> & {
    refresh: () => void;
};

function defaultDecks(): DeckState {
    return [];
}

export function createDecksStore(): DecksStore {
    let _decks: DeckState = defaultDecks();

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
                        log.debug('Failed to refresh decks', res);
                        return [];
                    }
                    return res.json();
                })
                .then((data) => {
                    _decks = data;
                    set(_decks);
                })
                .catch((e) => {
                    log.error(`An error occurred while refreshing decks:`, e);
                });
        }
    };
}

export const decks = createDecksStore();

if (browser) {
    decks.refresh();
}
