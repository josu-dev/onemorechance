import type { SocketInstance } from '$game/types.client.js';
import { io } from 'socket.io-client';


export function createSocket(): SocketInstance {
    return io();
}
