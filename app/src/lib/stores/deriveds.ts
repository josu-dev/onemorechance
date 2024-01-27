import { derived } from 'svelte/store';
import { room } from './room';
import { user } from './user';
import { ws } from './ws';


export const wsUser = derived([ws, user], ([$ws, $user], set) => {
    if (!$ws.ws || !$user) return;
    $ws.ws.send(JSON.stringify({
        event: 'addMetadata',
        data: {
            userId: $user.id,
        },
    }));
    $ws.ws.addEventListener('close', () => {
        set(false);
    });
}, false);


export const wsRoom = derived([ws, room], ([$ws, $room], set) => {
    if (!$ws.ws || !$room) return;
    $ws.ws.send(JSON.stringify({
        event: 'addMetadata',
        data: {
            roomId: $room.id,
        },
    }));
    $ws.ws.addEventListener('close', () => {
        set(false);
    });
}, false);
