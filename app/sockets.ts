import type { IncomingMessage, ServerResponse, Server } from "http";
import { Server as ioServer } from "socket.io";

import { nanoid } from 'nanoid';

type User = {
    id: string,
    name: string,
    socketId: string,
}

const users = new Map<string, User>();

type Room = {
    id: string,
    host: User,
    players: User[],
    status: string,
    ready: string[],
}

const rooms = new Map<string, Room>();

import type {
	ClientToServerEvents,
	ServerToClientEvents,
	InterServerEvents,
	SocketData
} from "./src/types";

export function attach_sockets(
	server: Server<typeof IncomingMessage, typeof ServerResponse>
) {

	const io = new ioServer<
		ClientToServerEvents,
		ServerToClientEvents,
		InterServerEvents,
		SocketData
	>(server);
    
    io.on('connection', (socket) => {
        // socket.emit('sssid', socket.id);
        socket.on('register_user', ({name}) => {
            const userId = nanoid();
            const user = {
                id: userId,
                name: name,
                socketId: socket.id,
            }
            users.set(userId, user);
            socket.emit('registered', user);
        });

        socket.on('create_room', ({userId}) => {
            console.log('create_room', userId);
            const user = users.get(userId);
            if (!user) return;

            const roomId = nanoid();
            const room:Room = {
                id: roomId,
                host: user,
                players: [user],
                status: 'waiting',
                ready: [],
            }
            rooms.set(roomId, room);
            socket.join(roomId);
            socket.emit('created_room', room);
        });

        socket.on('join_room', ({roomId, userId}) => {
            console.log('join_room', roomId, userId);
            const room = rooms.get(roomId);
            console.log('user', room);
            if (!room) {
                return;
            }
            const user = users.get(userId);
            console.log('user', user);
            if (!user) {
                return;
            }
            socket.join(roomId);
            room.players.push(user);
            socket.emit('joined_room', room);
            io.to(roomId).emit('user_joined_room', user);
        });
        
        socket.on('messageToRoom', ({roomId, message}) => {
            io.to(roomId).emit('message', message);
        });
    });
}
