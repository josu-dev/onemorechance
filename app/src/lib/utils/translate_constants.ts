import * as C from '$shared/constants.js';


class EnumTranslationError extends Error {
    constructor(source: string, value: string) {
        super(`Translation not provided for ${source} value: ${value}`);
        this.name = 'EnumTranslationError';
    }
}

function deckType(value: C.DeckType) {
    switch (value) {
        case C.DECK_TYPE.SELECT:
            return 'Elegir';
        case C.DECK_TYPE.COMPLETE:
            return 'Completar';
        default: throw new EnumTranslationError('DeckType', value);
    }
}

function playerRole(value: C.PlayerRole) {
    switch (value) {
        case C.PLAYER_ROLE.HOST:
            return 'Anfitrion';
        case C.PLAYER_ROLE.GUEST:
            return 'Invitado';
        default: throw new EnumTranslationError('PlayerRole', value);
    }
}

const translations = {
    deckType,
    playerRole
};

export const t = translations;
