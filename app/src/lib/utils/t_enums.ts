import * as game from '$game/enums.js';


class EnumTranslationError extends Error {
    constructor(source: string, value: string) {
        super(`Translation not provided for ${source} value: ${value}`);
        this.name = 'EnumTranslationError';
    }
}

function deckType(value: game.DeckType) {
    switch (value) {
        case game.DECK_TYPE.CHOOSE:
            return 'Elegir';
        case game.DECK_TYPE.COMPLETE:
            return 'Completar';
        default: throw new EnumTranslationError('DeckType', value);
    }
}

function playerRole(value: game.PlayerRole) {
    switch (value) {
        case game.PLAYER_ROLE.HOST:
            return 'Anfitrion';
        case game.PLAYER_ROLE.GUEST:
            return 'Invitado';
        default: throw new EnumTranslationError('PlayerRole', value);
    }
}

const translations = {
    deckType,
    playerRole
};

export const t = translations;
