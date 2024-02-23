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
    error?: string,
};

export type SocketStore = ExposedReadablePartial<SocketState> & {
    instance: SocketInstance,
    setAuth(key: string, value: string): void,
};

export function createSocketStore(): SocketStore {
    const _auth: Record<string, string> = {};

    const _socket = io({
        autoConnect: false,
        auth(cb) {
            cb(_auth);
        },
    });

    const _state: SocketState = {
        initialized: false,
        connected: false,
        connecting: false,
        error: undefined,
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
        setAuth(key: string, value: string) {
            _auth[key] = value;
        }
    };
}

export function createSocketActions(socket: SocketStore) {
    return {
        connect(userId: string) {
            socket.setAuth('userId', userId);
            socket.instance.connect();
        },
        disconnect() {
            socket.instance.disconnect();
        },
    };
}

export function attachSocketListeners(socket: SocketStore) {
    socket.instance.on('connect', () => {
        log.debug(`Connected to websocket server`);

        socket.mset({
            initialized: true,
            connected: true,
            connecting: false,
            error: undefined,
        });
    });

    socket.instance.on('disconnect', (reason) => {
        log.debug(`Disconnected from websocket server: ${reason}`);

        socket.mset({
            connected: false,
            connecting: false,
        });
    });

    socket.instance.on('unauthorized', (data, cb) => {
        log.error(`Unauthorized: ${data.error}`);

        socket.value.error = data.error;
        socket.sync();
        cb(true);
    });
}
