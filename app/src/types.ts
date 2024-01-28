import type { GameStatus, PlayerRating, RoomStatus } from './lib/enums.js';

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
    userId: string,
    name: string,
    role: PlayerRole,
    score: number,
    totalScore: number,
    ready: boolean,
    phrases: Phrase[],
    options: Option[],
    selectedOption?: Option,
    freestyle?: string[],
    modifiers: Modifier[],
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
    [x: string]: any;
    id: string,
    name: string,
};

export type Deck = {
    id: string,
    name: string,
    phrases: Phrase[],
    options: Option[],
};

export type Game = {
    id: string;
    status: GameStatus;
    maxRounds: number;
    maxOptions: number;
    chooseTime: number;
    round: number,
    deck: DeckIdentifier,
    phrase: Phrase,
    usedPhrases: string[],
    usedOptions: string[],
    players: Player[],
    ratingPlayer?: string,
    lastWinner?: string,
};

export type Room = {
    id: string,
    status: RoomStatus,
    host: User,
    users: User[],
    readyCount: number,
    game: Game,
};


export type ServerToClientEvents = {
    registered: (data: User) => void;
    unregistered: () => void;
    created_room: (data: Room) => void;
    updated_room: (data: Room) => void;
    joined_room: (data: Room) => void;
    user_join_room: (data: {user:User, player:Player}) => void;
    user_left_room: (data: User) => void;
    game_started: (data: Game) => void;
    availible_decks_update: (data: DeckIdentifier[]) => void;
    updated_round: (data: Game) => void;
    selection_end: (data: Game) => void;
    player_updated: (data: Player) => void;
    game_updated: (data: Game) => void;
    rate_player: (data: { playerId: string;}) => void;
    game_status_update: (data: { status: GameStatus; }) => void;
    game_deck_update: (data: DeckIdentifier) => void;
};


export type ClientToServerEvents = {
    register_user: (data: { userId?: string, name: string; }) => void;
    unregister_user: (data: { userId: string; }) => void;
    create_room: (data: { userId: string; }) => void;
    update_room: (data: { roomId: string; data: Room; }) => void;
    join_room: (data: { roomId: string; userId: string; }) => void;
    leave_room: (data: { roomId: string; userId: string; }) => void;
    trigger_decks_update: () => void;
    update_room_deck: (data: { roomId: string; deckId:string; }) => void;
    player_ready: (data: { roomId: string; userId: string; }) => void;
    player_unready: (data: { roomId: string; userId: string; }) => void;
    start_game: (data: { roomId: string; userId: string; }) => void;
    get_new_round: (data: { roomId: string; userId: string; options: number; }) => void;
    option_selected: (data: { roomId: string; userId: string; option: Option; }) => void;
    player_update: (data: { roomId: string; player: Player; }) => void;
    rate_player: (data: { roomId: string; playerId: string; rate: PlayerRating; }) => void;
    game_update: (data: { roomId: string; game: Game; }) => void;
};


export type InterServerEvents = Record<string, never>;


export type SocketData = {
    name: string;
};
