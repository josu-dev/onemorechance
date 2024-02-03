import type { DeckType, GameStatus, PlayerRating } from '$game/enums';
import type * as Client from '$game/types.client';
import type * as SocketIO from 'socket.io';


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
    register_user: (data: { userId?: string, name: string; }) => void;
    unregister_user: (data: { userId: string; }) => void;

    create_room: (data: { userId: string; }) => void;
    update_room: (data: { roomId: string; data: Client.Room; }) => void;
    close_room: (data: { roomId: string; userId: string; }) => void;
    join_room: (data: { roomId: string; userId: string; }) => void;
    leave_room: (data: { roomId: string; userId: string; }) => void;
    kick_player: (data: { roomId: string; userId: string; }) => void;
    trigger_decks_update: () => void;
    update_room_deck: (data: { roomId: string; deckId: string; }) => void;
    player_ready: (data: { roomId: string; userId: string; }) => void;
    player_unready: (data: { roomId: string; userId: string; }) => void;

    start_game: (data: { roomId: string; userId: string; }) => void;
    get_new_round: (data: { roomId: string; userId: string; options: number; }) => void;
    option_selected: (data: { roomId: string; userId: string; option: Option[]; }) => void;
    freestyle_selected: (data: { roomId: string; userId: string; freestyle: string[]; }) => void;
    player_update: (data: { roomId: string; player: Client.Player; }) => void;
    rate_player: (data: { roomId: string; playerId: string; rate: PlayerRating; }) => void;
    game_update: (data: { roomId: string; game: Client.Game; }) => void;
};


export type ServerToClientEvents = {
    registered: (data: User) => void;
    unregistered: () => void;

    room_create: (data: Client.Room) => void;
    room_update: (data: Client.Room) => void;
    room_close: (data: { roomId: string; }) => void;
    room_join: (data: Client.Room) => void;
    room_full: (data: { maxPlayers: number; }) => void;
    player_join: (data: { player: Client.Player; }) => void;
    player_left: (data: { id: string; }) => void;
    player_kick: (data: { id: string; }) => void;
    player_disconnect: (data: { id: string; }) => void;

    availible_decks_update: (data: DeckIdentifier[]) => void;

    game_started: (data: Client.Game) => void;
    updated_round: (data: Client.Game) => void;
    selection_end: (data: Client.Game) => void;
    player_updated: (data: Client.Player) => void;
    game_updated: (data: Client.Game) => void;
    rate_next_player: (data: { playerId: string; }) => void;
    game_status_update: (data: { status: GameStatus; }) => void;
    game_deck_update: (data: DeckIdentifier) => void;
};


export type InterServerEvents = Record<string, never>;


export type SocketData = {
    name: string;
};


export type WebSocketServer = SocketIO.Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

export type WebSocketServerSocket = SocketIO.Socket<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;
