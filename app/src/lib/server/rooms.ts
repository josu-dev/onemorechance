import { nanoid } from 'nanoid';
import { getUser, type User } from './users';

type RoomUpdate = {
    type:string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data:any;
    timestamp: number;
}

export class Room {
    public id: string;
    public players: User[];
    public status: string;
    public host: User;
    public updates: RoomUpdate[] = [];

    constructor(id: string, host: User) {
        this.id = id;
        this.players = [host];
        this.status = 'room_lobby';
        this.host = host;
    }

    toJSON() {
        return {
            id: this.id,
            players: this.players,
            status: this.status,
            host: this.host,
        }
    }
}


const rooms = new Map<string, Room>();

export async function createRoom(host:User, roomId?:string) {
    const _roomId = roomId ?? nanoid(); 
    const room = new Room(_roomId, host);

    rooms.set(_roomId, room);

    return room;
}

export async function joinRoom(roomId:string, user:User) {
    const room = rooms.get(roomId);
    if (!room) {
        return undefined;
    }

    room.players.push(user);
    return room;
}

export async function getFullRoom(roomId:string) {
    const room = rooms.get(roomId);
    if (!room) {
        return undefined;
    }

    return room;
}

// export async function getGame(gameId: string) {
//     const game = games.get(gameId);
//     if (!game) {
//         return undefined;
//     }

//     return game;
// }

// export async function addPlayer(gameId: string, userId: string) {
//     const game =await getGame(gameId);
//     const user =await getUser(userId);
//     if (!game || !user) {
//         return undefined;
//     }

//     game.players.push(user);
//     return {
//         game: game,
//         user: user,
//     }
// }

// export async function registerUpdate(gameId: string, update: RoomUpdate) {
//     const game = await getGame(gameId);
//     if (!game) {
//         return undefined;
//     }

//     game.addUpdate(update);
//     return game;
// }

// export async function getLastUpdate(gameId: string) {
//     const game = await getGame(gameId);
//     if (!game) {
//         return undefined;
//     }

//     let update = game.updates[0]
//     if (!update) {
//         update = {
//             type: 'none',
//             data: null,
//             timestamp: Date.now(),
//         };
//         game.addUpdate(update);
//     }

//     return update;
// }

// export async function getPendingUpdates(gameId: string, lastUpdateTimestamp: number = 0) {
//     const game = await getGame(gameId);
//     if (!game) {
//         return undefined;
//     }
//     const updates: RoomUpdate[]= []
//     for (const update of game.updates) {
//         if (update.timestamp > lastUpdateTimestamp) {
//             updates.push(update);
//         }
//         else {
//             break;
//         }
//     }

//     return updates;
// }

// export async function getUpdate(gameId: string, lastUpdateTimestamp: number = 0) {
//     const game = await getGame(gameId);
//     if (!game) {
//         return undefined;
//     }
//     const updates: RoomUpdate[]= []
//     for (const update of game.updates) {
//         if (update.timestamp > lastUpdateTimestamp) {
//             updates.push(update);
//         }
//         else {
//             break;
//         }
//     }

//     return updates;
// }

// export async function get(id: string) :Promise<boolean>{
//     return users.delete(id);
// }
