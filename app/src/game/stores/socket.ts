import type { ExposedReadablePartial } from '$lib/stores/types.ts';
import { log } from '$lib/utils/logging.ts';
import type { ClientToServerEvents, ServerToClientEvents } from '$shared/types.js';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { writable } from 'svelte/store';


export type SocketInstance = Socket<ServerToClientEvents, ClientToServerEvents>;

export type SocketState = {
    initialized: boolean,
    connected: boolean,
    connecting: boolean,
};

export type SocketStore = ExposedReadablePartial<SocketState> & {
    instance: SocketInstance,
};

export function createSocketStore(): SocketStore {
    const _socket = io({
        autoConnect: false,
    });

    const _state = {
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
        mset(value) {
            if (_state !== value) {
                Object.assign(_state, value);
            }
            set(_state);
        },
        sync() {
            set(_state);
        },
        get instance() {
            return _socket;
        },
    };
}


export function createSocketActions(socket: SocketStore) {
    return {
        connect() {
            socket.instance.connect();
        },
        disconnect() {
            socket.instance.disconnect();
        },
    };
}


export function attachSocketListeners(socket: SocketStore) {
    socket.instance.on('connect', () => {
        socket.mset({
            initialized: true,
            connected: true,
            connecting: false,
        });

        log.debug(`Connected to websocket server`);
    });

    socket.instance.on('disconnect', (reason) => {
        socket.mset({
            connected: false,
            connecting: false,
        });

        log.debug(`Disconnected from websocket server: ${reason}`);
    });
}
