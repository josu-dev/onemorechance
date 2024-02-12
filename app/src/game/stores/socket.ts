import type { SocketState, SocketStore } from '$game/types.js';
import { io } from 'socket.io-client';
import { writable } from 'svelte/store';


export function createSocketStore(): SocketStore {
    const _socket = io({
        autoConnect: false,
    });

    let _state = {
        initialized: false,
        connected: false,
        connecting: false,
    };

    const { subscribe, set } = writable<SocketState>(_state);

    return {
        subscribe,
        get value() {
            return _state;
        },
        sync() {
            set(_state);
        },
        mset(value) {
            _state = value;
            set(_state);
        },
        get socket() {
            return _socket;
        },
    };
}


export function createSocketActions(socket: SocketStore) {
    return {
        connect() {
            socket.socket.connect();
        },
        disconnect() {
            socket.socket.disconnect();
        },
    };
}


export function attachSocketListeners(socket: SocketStore) {
    socket.socket.on('connect', () => {
        socket.mset({
            initialized: true,
            connected: true,
            connecting: false,
        });
        console.log('connected to websocket');
    });

    socket.socket.on('disconnect', (reason) => {
        socket.mset({
            connected: false,
            connecting: false,
            initialized: false,
        });
        console.log('disconnected from websocket by: ', reason);
    });
}
