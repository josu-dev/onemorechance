import type { SocketInstance } from '$game/types.client.js';
import { io } from 'socket.io-client';


export function createSocket(): SocketInstance {
    return io({
        autoConnect: false,
    });
}

export function createSocketActions(socket: SocketInstance) {
    return {
        connect() {
            socket.connect();
        },
        disconnect() {
            socket.disconnect();
        },
    };
}

export function attachSocketListeners(socket: SocketInstance) {
    socket.on('connect', () => {
        console.log('connected to websocket');
    });

    socket.on('disconnect', (reason) => {
        console.log('disconnected from websocket', reason);
    });
}
