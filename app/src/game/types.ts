import type { DeckType, GameStatus, PlayerRating } from './enums.js';
import type * as Client from './types.client.js';


export type EmptyObject = Record<string, never>;

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

export type DeckChoose = {
    type: 'CHOOSE',
    phrases: Phrase[],
    options: Option[],
};

export type DeckComplete = {
    type: 'COMPLETE',
    phrases: Phrase[],
};

export type Deck = DeckIdentifier & (DeckChoose | DeckComplete);


export type ClientToServerEvents = {
    user_register: (data: { id?: string, name: string; }) => void;
    user_unregister: (data: { id: string; }) => void;

    room_create: (data: EmptyObject) => void;
    room_update: (data: { room: Client.Room; }) => void;
    room_close: (data: { roomId: string; }) => void;
    room_join: (data: { roomId: string; }) => void;
    room_leave: (data: { roomId: string; }) => void;
    room_kick_player: (data: { roomId: string; playerId: string; }) => void;

    player_update: (data: { roomId: string; player: Client.Player; }) => void;
    player_set_name: (data: { roomId: string; name: string; }) => void;
    player_set_ready: (data: { roomId: string; state: boolean; }) => void;

    game_start: (data: { roomId: string; }) => void;
    // game_update: (data: { roomId: string; game: Client.Game; }) => void;
    game_set_settings: (data: { roomId: string; game: Client.Game; }) => void;
    game_set_deck: (data: { roomId: string; deckId: string; }) => void;
    game_set_freestyle: (data: { roomId: string; freestyle: string[]; }) => void;
    game_set_option: (data: { roomId: string; option: Option[]; }) => void;
    game_rate_player: (data: { roomId: string; playerId: string; rate: PlayerRating; }) => void;
};


export type ServerToClientEvents = {
    user_registered: (data: { user: User; }) => void;
    user_unregistered: (data: EmptyObject) => void;

    room_created: (data: {
        room: Client.Room,
        game: Client.Game,
        players: Client.Player[];
    }) => void;
    room_joined: (data: {
        room: Client.Room,
        game: Client.Game,
        players: Client.Player[];
    }) => void;
    room_updated: (data: { room: Client.Room; }) => void;
    room_closed: (data: { roomId: string; }) => void;
    room_left: (data: { roomId: string; }) => void;
    room_full: (data: { roomId: string; maxPlayers: number; }) => void;

    player_updated: (data: { player: Client.Player; }) => void;
    player_joined: (data: { player: Client.Player; }) => void;
    player_left: (data: { playerId: string; }) => void;
    player_kicked: (data: { roomId: string, playerId: string; }) => void;
    player_disconnected: (data: { playerId: string; }) => void;

    decks_update: (data: { decks: DeckIdentifier[]; }) => void;

    // game_fill_ended: (data: { game: Client.Game; }) => void;
    game_rate_player: (data: { playerId: string; }) => void;
    game_started: (data: {
        game: Client.Game,
        players: Client.Player[];
    }) => void;
    game_status_updated: (data: { status: GameStatus; }) => void;
    game_updated: (data: { game: Client.Game; }) => void;
    game_updated_all: (data: { game: Client.Game; players: Client.Player[] }) => void;
};
