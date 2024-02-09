import { GAME_STATUS, ROOM_STATUS } from '$game/enums.js';
import type { GameStore, PlayersStore, RoomStore, SelfStore, SocketInstance } from '$game/types.client.js';


export function attachSharedListeners(socket: SocketInstance, self: SelfStore, room: RoomStore, game: GameStore, players: PlayersStore) {
    socket.on('connect', () => {
        self.value.socketId = socket.id || '';
        self.sync();

        if (self.value.id && self.value.name) {
            socket.emit('user_register', { id: self.value.id, name: self.value.name });
        }
    });

    socket.on('disconnect', () => {
        self.value.id = '';
        self.value.name = '';
        self.value.registered = false;
        self.sync();

        room.value.status = ROOM_STATUS.NO_ROOM;
        room.sync();

        game.value.status = GAME_STATUS.NOT_STARTED;
        game.sync();

        players.mset([]);
    });

    socket.on('user_unregistered', () => {
        self.value.id = '';
        self.value.name = '';
        self.value.registered = false;
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

        room.value.status = ROOM_STATUS.LEFT;
        room.sync();

        game.value.status = GAME_STATUS.NOT_STARTED;
        game.sync();

        players.mset([]);
    });

    socket.on('player_updated', (data) => {
        if (self.value.id === data.player.id) {
            self.value.current = data.player.current;
            self.value.ratesReceived = data.player.ratesReceived;
            self.value.registered = true;
            self.value.role = data.player.role;
            self.value.score = data.player.score;
            self.value.scoreLast = data.player.scoreLast;
            self.value.scoreTotal = data.player.scoreTotal;
            self.value.stock = data.player.stock;
            self.sync();
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

    socket.on('game_ended', () => {
        room.value.status = ROOM_STATUS.IN_LOBBY;
        room.sync();
        game.value.status = GAME_STATUS.ENDED;
        game.sync();
    });

    socket.on('game_started', (data) => {
        room.value.status = ROOM_STATUS.IN_GAME;
        room.sync();
        game.mset(data.game);
        players.mset(data.players);
    });

    socket.on('game_status_updated', (data) => {
        game.value.status = data.status;
        game.sync();
    });

    socket.on('game_updated_all', (data) => {
        game.mset(data.game);
        players.mset(data.players);
        for (const player of data.players) {
            if (player.id === self.value.id) {
                self.value.current = player.current;
                self.value.ratesReceived = player.ratesReceived;
                self.value.role = player.role;
                self.value.score = player.score;
                self.value.scoreLast = player.scoreLast;
                self.value.scoreTotal = player.scoreTotal;
                self.value.stock = player.stock;
                self.sync();
                break;
            }
        }
    });
}