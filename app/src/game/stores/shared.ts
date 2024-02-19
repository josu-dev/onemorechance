import type { RoomStore, SocketStore } from '$game/types.js';
import type { UserStore } from '$lib/stores/user.js';
import { log } from '$lib/utils/logging.ts';
import { GAME_STATUS, ROOM_STATUS_CLIENT } from '$shared/constants.js';
import type { GameStore } from './game.ts';
import type { PlayersStore } from './players.ts';
import type { SelfStore } from './self.ts';


export function attachSharedListeners(socket: SocketStore, user: UserStore, self: SelfStore, room: RoomStore, game: GameStore, players: PlayersStore) {
    socket.instance.on('disconnect', () => {
        players.reset();
        game.reset();
        if (
            room.value.status === ROOM_STATUS_CLIENT.CONNECTING ||
            room.value.status === ROOM_STATUS_CLIENT.GAME_ON ||
            room.value.status === ROOM_STATUS_CLIENT.WAITING
        ) {
            room.value.status = ROOM_STATUS_CLIENT.CONNECTION_LOST;
            room.sync();
        }
        self.reset();
    });

    socket.instance.on('room_created', (data) => {
        room.mset(data.room);

        game.mset(data.game);

        players.mset(data.players);
    });

    socket.instance.on('room_joined', (data) => {
        room.mset(data.room);

        game.mset(data.game);

        players.mset(data.players);

        log.debug('room_joined', data);
    });

    socket.instance.on('room_closed', (data) => {
        if (data.roomId !== room.value.id) {
            return;
        }

        log.debug('room_closed', data);

        room.value.status = ROOM_STATUS_CLIENT.CLOSED;
        room.sync();

        game.value.status = GAME_STATUS.ENDED;
        game.sync();
    });

    socket.instance.on('room_left', (data) => {
        if (data.roomId !== room.value.id) {
            return;
        }

        log.debug('room_closed', data);

        room.value.status = ROOM_STATUS_CLIENT.LEFT;
        room.sync();

        game.reset();

        players.reset();

    });

    socket.instance.on('player_updated', (data) => {
        log.debug('player_updated', data);
        players.update(data.player);
    });

    socket.instance.on('player_kicked', (data) => {
        log.debug('player_kicked', data);
        if (self.value.player.id === data.playerId) {
            room.value.status = ROOM_STATUS_CLIENT.KICKED;
            room.sync();
            return;
        }

        players.remove(data.playerId);
    });

    socket.instance.on('game_ended', () => {
        log.debug('game_ended');
        room.value.status = ROOM_STATUS_CLIENT.WAITING;
        room.sync();
        game.value.status = GAME_STATUS.ENDED;
        game.sync();
    });

    socket.instance.on('game_started', (data) => {
        log.debug('game_started', data);
        room.value.status = ROOM_STATUS_CLIENT.GAME_ON;
        room.sync();
        game.mset(data.game);
        players.mset(data.players);
    });

    socket.instance.on('game_status_updated', (data) => {
        log.debug('game_status_updated', data);
        game.value.status = data.status;
        game.sync();
    });

    socket.instance.on('game_updated_all', (data) => {
        log.debug('game_updated_all', data);
        game.mset(data.game);
        players.mset(data.players);
    });
}
