import type { IncomingMessage, Server, ServerResponse } from "http";
import { nanoid } from 'nanoid';
import { Server as ioServer } from "socket.io";
import type {
    ClientToServerEvents,
    InterServerEvents,
    Room,
    ServerToClientEvents,
    SocketData,
    User
} from "./src/types";

const users = new Map<string, User>();

const rooms = new Map<string, Room>();


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
        socket.on('register_user', ({ name }) => {
            const userId = nanoid();
            const user: User = {
                id: userId,
                name: name,
                socketId: socket.id,
                totalScore: 0,
            };
            users.set(userId, user);
            socket.emit('registered', user);
        });

        socket.on('create_room', ({ userId }) => {
            const user = users.get(userId);
            if (!user) return;

            const roomId = nanoid();
            const room: Room = {
                id: roomId,
                host: user,
                players: [user],
                status: 'waiting',
                ready: [],
            };
            rooms.set(roomId, room);
            socket.join(roomId);
            socket.emit('created_room', room);
        });

        socket.on('join_room', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            const user = users.get(userId);
            if (!room || !user) {
                return;
            }
            
            socket.join(roomId);
            room.players.push(user);
            socket.emit('joined_room', room);
            io.to(roomId).emit('user_joined_room', user);
        });

        socket.on('message_to_room', ({ roomId, message }) => {
            io.to(roomId).emit('room_message', message);
        });
    });
}
