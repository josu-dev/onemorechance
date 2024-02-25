import type { GameStore, PlayersStore, RoomStore, SelfStore, SocketStore } from '$game/types.js';
import type { UserStore } from '$lib/stores/user.js';
import { log } from '$lib/utils/clientside.ts';
import { GAME_STATUS, ROOM_STATUS_CLIENT } from '$shared/constants.js';


export function attachSharedListeners(socket: SocketStore, user: UserStore, self: SelfStore, room: RoomStore, game: GameStore, players: PlayersStore) {
    socket.instance.on('disconnect', (reason) => {
        players.reset();
        game.reset();
        if (reason === 'io client disconnect') {
            room.value.status = ROOM_STATUS_CLIENT.LEFT;
        }
        else if (
            room.value.status === ROOM_STATUS_CLIENT.CONNECTING ||
            room.value.status === ROOM_STATUS_CLIENT.GAME_ACTIVE ||
            room.value.status === ROOM_STATUS_CLIENT.LOBBY_WAITING
        ) {
            room.value.status = ROOM_STATUS_CLIENT.CONNECTION_LOST;
        }
        room.sync();
        self.reset();
    });

    socket.instance.on('room_error', ({ ev, err }) => {
        log.debug(`room_error: ${ev} - ${err}`);
        if (ev === 'room_join') {
            room.value.status = ROOM_STATUS_CLIENT.NOT_FOUND;
        }

        room.sync();
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
        room.value.status = ROOM_STATUS_CLIENT.LOBBY_WAITING;
        room.sync();
        game.value.status = GAME_STATUS.ENDED;
        game.sync();
    });

    socket.instance.on('game_started', (data) => {
        log.debug('game_started', data);
        room.value.status = ROOM_STATUS_CLIENT.GAME_ACTIVE;
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
