export type User = {
    id: string,
    name: string,
    socketId: string,
    totalScore: number;
};


export type Room = {
    id: string,
    host: User,
    players: User[],
    status: string,
    ready: string[],
};


export type Message = {
    author: string;
    text: string;
    bot: boolean;
};


export type ServerToClientEvents = {
    registered: (data: User) => void;
    created_room: (data: Room) => void;
    joined_room: (data: Room) => void;
    user_joined_room: (data: User) => void;
    user_left_room: (data: User) => void;
    game_started: (data: Room) => void;
    room_message: (data: Message) => void;
};


export type ClientToServerEvents = {
    register_user: (data: { name: string; }) => void;
    create_room: (data: { userId: string; }) => void;
    join_room: (data: { roomId: string; userId: string; }) => void;
    leave_room: (data: { roomId: string; userId: string; }) => void;
    start_game: (data: { roomId: string; userId: string; }) => void;
    ready: (data: { roomId: string; userId: string; }) => void;
    unready: (data: { roomId: string; userId: string; }) => void;
    message_to_room: (data: { roomId: string; message: Message; }) => void;
};


export type InterServerEvents = Record<string, never>;


export type SocketData = {
    name: string;
};
