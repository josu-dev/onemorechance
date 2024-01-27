import { browser } from '$app/environment';
import type { WebSocketMessage } from '$lib/types';
import { derived, writable } from 'svelte/store';
import { user } from './user';

let webSocketEstablished = false;
type CustomWebSocket = WebSocket & { sswsId?: string; };
let _ws: CustomWebSocket | undefined = undefined;
let log: string[] = [];

const logEvent = (str: string) => {
    log = [...log, str];
};

type WebSocketStore = {
    messages: WebSocketMessage[];
    ws?: CustomWebSocket;
    lastMessage?: WebSocketMessage;
};

function createWSStore() {
    const { subscribe, set, update } = writable<WebSocketStore>({
        messages: [],
        ws: undefined
    });

    function send(event: WebSocketMessage) {
        try {
            _ws?.send(JSON.stringify(event));
        }
        catch (e) {
            console.error('[csws] error sending message', event);
        }
    }

    return {
        subscribe,
        set,
        update,
        send,
        get peek() {
            return _ws;
        },
    };
}

export const ws = createWSStore();

export const establishWebSocket = () => {
    if (webSocketEstablished) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    _ws = new WebSocket(`${protocol}//${window.location.host}/websocket`);
    ws.set({ messages: [], ws: _ws });
    _ws.addEventListener('open', event => {
        webSocketEstablished = true;
        console.log('[websocket] connection open', event);
        logEvent('[websocket] connection open');
        console.log(event);
        _ws?.send(JSON.stringify({ event: 'addMetadata', }));
        
        ws.update(store => store)
    });
    console.log(_ws);
    _ws.addEventListener('close', event => {
        console.log('[websocket] connection closed', event);
        logEvent('[websocket] connection closed');
    });
    _ws.addEventListener('message', event => {
        let data: WebSocketMessage;
        try {
            data = JSON.parse(event.data);
        }
        catch (e) {
            console.error('[csws] error parsing message', event.data);
            return;
        }
        console.info('[csws] message received', data)

        ws.update(store => {
            store.messages.unshift(data);
            store.lastMessage = data;
            return store;
        });

        if (data.event === 'currentSocketId') {
            event.currentTarget!.sswsId = data.data;
            fetch(`/api/ws`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ event: "updateSswsId", data: data.data }),
            });
            return;
        }
        console.log('[websocket] message received', event);
        logEvent(`${event.data}`);
    });
};
