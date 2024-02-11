import type { DeckType, GameStatus, PlayerRating, PlayerRole, RoomStatus, RoomStatusClient } from './constants.js';


export type * from './constants.js';

export type Room = {
    id: string,
    name?: string,
    status: RoomStatus,
    hostId: string,
    maxPlayers: number,
};

export type RoomClient = {
    id: string,
    name?: string,
    status: RoomStatusClient,
    hostId: string,
    maxPlayers: number,
};

export type GameSettings = {
    deckId: string,
    fillTime: number,
    options: number,
    players: number,
    rateTime: number,
    rounds: number,
};

export type Game = {
    id: string;
    roomId: string;
    status: GameStatus;
    settings: GameSettings;
    deck: DeckIdentifier,
    round: number,
    current: {
        phrase: Phrase,
        ratingPlayer?: string,
        winner?: string,
    },
    used: {
        phrases: string[],
        options: string[],
    },
};

export type Player = {
    id: string,
    name: string,
    role: PlayerRole,
    score: number,
    scoreLast: number,
    scoreTotal: number,
    ready: boolean,
    current: {
        modifier?: string,
        option?: Option[],
        freestyle?: string[],
    },
    stock: {
        options: Option[];
        modifiers: string[],
    },
    used: {
        options: Option[],
        modifiers: string[],
        freestyle: string[],
    },
    ratesReceived: Record<string, string>,
};

export type SelfPlayer = Player & {
    registered: boolean,
    socketId: string,
};

export type User = {
    id: string,
    name: string,
    socketId: string,
};

export type Modifier = {
    type: string,
    name: string,
    description: string,
};

export type Phrase = {
    id: string,
    text: string,
};

export type Option = {
    id: string,
    text: string,
};

export type DeckIdentifier = {
    id: string,
    name: string,
    type: DeckType,
    description?: string,
};

export type DeckSelect = {
    type: 'SELECT',
    phrases: Phrase[],
    options: Option[],
};

export type DeckComplete = {
    type: 'COMPLETE',
    phrases: Phrase[],
};

export type Deck = DeckIdentifier & (DeckSelect | DeckComplete);


export type ClientToServerEvents = {
    user_register: (data: { id?: string, name: string; }) => void;
    user_unregister: (data: { id: string; }) => void;

    room_create: () => void;
    room_update: (data: { room: Room; }) => void;
    room_close: (data: { roomId: string; }) => void;
    room_join: (data: { roomId: string; }) => void;
    room_leave: (data: { roomId: string; }) => void;
    room_kick_player: (data: { roomId: string; playerId: string; }) => void;

    player_update: (data: { roomId: string; player: Player; }) => void;
    player_set_name: (data: { roomId: string; name: string; }) => void;
    player_set_ready: (data: { roomId: string; state: boolean; }) => void;

    game_start: (data: { roomId: string; }) => void;
    game_set_settings: (data: { roomId: string; settings: Partial<GameSettings>; }) => void;
    game_set_freestyle: (data: { roomId: string; freestyle: string[]; }) => void;
    game_set_option: (data: { roomId: string; option: Option[]; }) => void;
    game_rate_player: (data: { roomId: string; playerId: string; rate: PlayerRating; }) => void;
};


export type ServerToClientEvents = {
    user_registered: (data: { user: User; }) => void;
    user_unregistered: () => void;

    room_created: (data: {
        room: Room,
        game: Game,
        players: Player[];
    }) => void;
    room_joined: (data: {
        room: Room,
        game: Game,
        players: Player[];
    }) => void;
    room_updated: (data: { room: Room; }) => void;
    room_closed: (data: { roomId: string; }) => void;
    room_left: (data: { roomId: string; }) => void;
    room_full: (data: { roomId: string; maxPlayers: number; }) => void;

    player_updated: (data: { player: Player; }) => void;
    player_joined: (data: { player: Player; }) => void;
    player_left: (data: { playerId: string; }) => void;
    player_kicked: (data: { roomId: string, playerId: string; }) => void;
    player_disconnected: (data: { playerId: string; }) => void;

    decks_update: (data: { decks: DeckIdentifier[]; }) => void;

    game_ended: () => void;
    game_player_rated: (data: { playerId: string; }) => void;
    game_started: (data: {
        game: Game,
        players: Player[];
    }) => void;
    game_status_updated: (data: { status: GameStatus; }) => void;
    game_updated: (data: { game: Game; }) => void;
    game_updated_all: (data: { game: Game; players: Player[]; }) => void;
};
