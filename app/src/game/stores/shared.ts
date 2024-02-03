import type { GameStore, PlayersStore, RoomStore, SelfStore, SocketInstance } from '$game/types.client';
import { GAME_STATUS, ROOM_STATUS } from '$game/enums';


export function attachSharedListeners(socket: SocketInstance, self:SelfStore, room: RoomStore, game: GameStore, players: PlayersStore) {
    socket.on('user_unregistered', () => {
        self.value.registered = false;
        self.value.name = '';
        self.sync();

        room.value.status = ROOM_STATUS.NO_ROOM;
        game.sync();

        game.value.status = GAME_STATUS.NOT_STARTED;
        game.sync();

        players.mset([]);
    });

    socket.on('room_created', (data) => {
        for (const player of data.players) {
            if (player.id === self.value.id) {
                self.mset({
                    ...player,
                    registered: true,
                    socketId: self.value.socketId,
                });
                break;
            }
        }

        room.mset(data.room);

        game.mset(data.game);

        players.mset(data.players);
    });

    socket.on('room_joined', (data) => {
        for (const player of data.players) {
            if (player.id === self.value.id) {
                self.mset({
                    ...player,
                    registered: true,
                    socketId: self.value.socketId,
                });
                break;
            }
        }

        room.mset(data.room);

        game.mset(data.game);

        players.mset(data.players);
    });

    socket.on('room_closed', (data) => {
        if (data.roomId !== room.value.id) {
            return;
        }

        room.value.status = ROOM_STATUS.CLOSED;
        room.sync();

        game.value.status = GAME_STATUS.ENDED;
        game.sync();

        players.mset([]);
    });

    socket.on('room_left', (data) => {
        if (data.roomId !== room.value.id) {
            return;
        }

        room.value.status = ROOM_STATUS.NO_ROOM;
        room.sync();

        game.value.status = GAME_STATUS.NOT_STARTED;
        game.sync();

        players.mset([]);
    });
    
    socket.on('player_updated', (data) => {
        if (self.value.id === data.player.id) {
            self.mset({
                ...data.player,
                registered: true,
                socketId: self.value.socketId,
            });
        }

        let foundIndex = -1;
        for (let i = 0; i < players.value.length; i++) {
            if (players.value[i].id === data.player.id) {
                foundIndex = i;
                break;
            }
        }
        if (foundIndex === -1) {
            return;
        }

        players.value[foundIndex] = data.player;
        players.sync();
    });

    socket.on('player_kicked', (data) => {
        if (self.value.id === data.playerId) {
            room.value.status = ROOM_STATUS.NO_ROOM;
            room.sync();

            game.value.status = GAME_STATUS.NOT_STARTED;
            game.sync();

            players.mset([]);
            return;
        }

        let foundIndex = -1;
        for (let i = 0; i < players.value.length; i++) {
            if (players.value[i].id === data.playerId) {
                foundIndex = i;
                break;
            }
        }
        if (foundIndex === -1) {
            return;
        }
        players.value.splice(foundIndex, 1);
        players.sync();
    });

    socket.on('game_started', (data) => {
        room.value.status = ROOM_STATUS.IN_GAME;
        room.sync();
        game.mset(data.game);
        players.mset(data.players);
    });    
}
