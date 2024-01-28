import type { GameStatus } from './lib/enums.js';

export type User = {
    id: string,
    name: string,
    socketId: string,
};

export type Modifier = {
    type: string,
};

export type PlayerRole = 'HOST' | 'INVITED';

export type Player = {
    role: PlayerRole,
    userId: string,
    score: number,
    ready: boolean,
    modifiers: Modifier[],
    phrases: Phrase[],
    selectedOption?: Option,
    options: Option[],
}

export type Phrase = {
    id: string,
    text: string,
};

export type Option = {
    id: string,
    text: string,
};


export type DeckIdentifier = {
    [x: string]: any;
    id: string,
    name: string,
};

export type Deck = {
    id: string,
    name: string,
    cards: Phrase[],
    options: Option[],
};

export type Game = {
    id: string;
    status: GameStatus;
    maxRounds: number;
    maxOptions: number;
    roundTime: number;
    round: number,
    deck: DeckIdentifier,
    phrase: Phrase,
    usedPhrases: string[],
    usedOptions: string[],
    players: Player[],
};

export type Room = {
    id: string,
    host: User,
    users: User[],
    readyCount: number,
    game: Game,
};

export type Message = {
    author: string;
    text: string;
    bot: boolean;
};


export type ServerToClientEvents = {
    registered: (data: User) => void;
    unregistered: () => void;
    created_room: (data: Room) => void;
    updated_room: (data: Room) => void;
    joined_room: (data: Room) => void;
    user_joined_room: (data: User) => void;
    user_left_room: (data: User) => void;
    game_started: (data: Game) => void;
    room_message: (data: Message) => void;
    availible_decks_update: (data: DeckIdentifier[]) => void;
    updated_round: (data: Game) => void;
    selection_end: (data: Game) => void;
};


export type ClientToServerEvents = {
    register_user: (data: { userId?: string, name: string; }) => void;
    unregister_user: (data: { userId: string; }) => void;
    create_room: (data: { userId: string; }) => void;
    update_room: (data: { roomId: string; data: Room }) => void;
    join_room: (data: { roomId: string; userId: string; }) => void;
    leave_room: (data: { roomId: string; userId: string; }) => void;
    player_ready: (data: { roomId: string; userId: string; }) => void;
    player_unready: (data: { roomId: string; userId: string; }) => void;
    start_game: (data: { roomId: string; userId: string; }) => void;
    trigger_decks_update: () => void;
    get_new_round: (data: { roomId: string; userId: string; options: number }) => void;
    option_selected: (data: { roomId: string; userId: string; option: Option; }) => void;
};


export type InterServerEvents = Record<string, never>;


export type SocketData = {
    name: string;
};
