import type { Server as HttpServer } from "http";
import { nanoid } from 'nanoid';
import { Server } from 'socket.io';
import { DECK_TYPE, GAME_STATUS, PLAYER_RATING, PLAYER_ROLE, ROOM_STATUS } from '../src/shared/constants.js';
import { GAME } from '../src/shared/defaults.js';
import importedDecks from '../static/decks/default.json' with { type: "json" };
import type * as T from './types.js';


const decks = importedDecks as Record<string, T.Deck>;

const DEFAULT_DECK = decks[GAME.DEFAULT_DECK_ID];


const users = new Map<string, T.ServerUser>();

// const players = new Map<string, T.Player>();

const rooms = new Map<string, T.ServerRoom>();


function removePlayerFromRoom(io: T.WebSocketServer, socket: T.WebSocketServerSocket, user: T.ServerUser, room: T.ServerRoom, playerId: string) {
    let roomIndex = -1;
    for (let i = 0; i < user.rooms.length; i++) {
        if (user.rooms[i] === room.room.id) {
            roomIndex = i;
            break;
        }
    }
    if (roomIndex > -1) {
        user.rooms.splice(roomIndex, 1);
    }

    let playerIndex = -1;
    for (let i = 0; i < room.players.length; i++) {
        if (room.players[i].id === playerId) {
            playerIndex = i;
            break;
        }
    }
    if (playerIndex > -1) {
        room.players.splice(playerIndex, 1);
    }

    if (room.players.length === 0) {
        rooms.delete(room.room.id);
        return;
    }

    if (room.room.hostId === playerId) {
        const hostPlayer = room.players[0];
        hostPlayer.host = true;
        hostPlayer.role = PLAYER_ROLE.HOST;
        room.room.hostId = hostPlayer.id;
    }

    io.to(room.room.id).emit('room_updated', { room: room.room });
}

function setupNewGame(room: T.ServerRoom) {
    room.game.status = GAME_STATUS.NOT_STARTED;
    room.game.round = 0;
    room.game.used.options = [];
    room.game.used.phrases = [];
    room.game.current.phrase = {
        id: '',
        text: '',
    };
    room.game.current.winner = undefined;
    room.game.current.ratingPlayer = undefined;
    for (const player of room.players) {
        player.ready = false;
        player.score = 0;
        player.scoreLast = 0;
        player.scoreTotal = 0;
        player.current.option = undefined;
        player.current.freestyle = undefined;
        player.current.modifier = undefined;
        player.used.freestyle = [];
        player.used.modifiers = [];
        player.used.options = [];
        player.ratesReceived = {};
    }
}

function newRound(io: T.WebSocketServer, socket: T.WebSocketServerSocket, room: T.ServerRoom) {
    room.game.round += 1;

    for (const player of room.players) {
        player.current.freestyle = undefined;
        player.current.modifier = undefined;
        player.current.option = undefined;
        player.scoreLast = player.score;
        player.score = 0;
        player.ratesReceived = {};
    }

    const deck = decks[room.game.deck.id];

    let phrase = deck.phrases[Math.floor(Math.random() * deck.phrases.length)]!;
    while (room.game.used.phrases.includes(phrase.id)) {
        phrase = deck.phrases[Math.floor(Math.random() * deck.phrases.length)]!;
    }

    room.game.used.phrases.push(phrase.id);
    room.game.current.phrase = phrase;

    if (deck.type === DECK_TYPE.SELECT) {
        for (const player of room.players) {
            const missingOptions = room.game.settings.options - player.stock.options.length;
            for (let i = 0; i < missingOptions; i++) {
                // @ts-ignore - We know that deck is a DeckChoose
                let option = deck.options[Math.floor(Math.random() * deck.options.length)];
                while (room.game.used.options.includes(option.id)) {
                    // @ts-ignore - We know that deck is a DeckChoose
                    option = deck.options[Math.floor(Math.random() * deck.options.length)];
                }
                player.stock.options.push(option);
                room.game.used.options.push(option.id);
            }
        }
    }

    room.game.status = GAME_STATUS.FILL_SENTENCE;
    io.to(room.room.id).emit('game_updated_all', { game: room.game, players: room.players });

    setTimeout(() => {
        room.game.status = GAME_STATUS.RATE_SENTENCE;
        io.to(room.room.id).emit('game_updated_all', { game: room.game, players: room.players });

        const playerCount = room.players.length;
        for (let i = 0; i < playerCount; i++) {
            setTimeout(
                (playerId) => {
                    io.to(room.room.id).emit('game_player_rated', { playerId: playerId });
                },
                i * room.game.settings.rateTime,
                room.players[i].id
            );
        }

        setTimeout(() => {
            let winnerId = '';
            let winnerScore = -1;

            for (const player of room.players) {
                let score = 0;
                for (const rate of Object.values(player.ratesReceived)) {
                    score += rate === PLAYER_RATING.GOD ? 10 : rate === PLAYER_RATING.MEH ? 0 : -10;
                }
                if (score > winnerScore) {
                    winnerId = player.id;
                    winnerScore = score;
                }
                player.score = score;
                player.scoreTotal += score;
            }

            room.game.current.winner = winnerId;
            room.game.status = GAME_STATUS.ROUND_WINNER;
            io.to(room.room.id).emit('game_updated_all', { game: room.game, players: room.players });

            if (room.game.round < room.game.settings.rounds) {
                setTimeout(
                    newRound,
                    GAME.DEFAULT_RESULTS_TIME,
                    io,
                    socket,
                    room
                );
                return;
            }

            setTimeout(() => {
                room.game.status = GAME_STATUS.END_SCOREBOARD;
                io.to(room.room.id).emit('game_status_updated', { status: room.game.status });

                setTimeout(() => {
                    room.room.status = ROOM_STATUS.WAITING;
                    room.game.status = GAME_STATUS.ENDED;
                    io.to(room.room.id).emit('game_ended');
                }, GAME.DEFAULT_SCOREBOARD_TIME);
            }, GAME.DEFAULT_RESULTS_TIME);

        }, playerCount * room.game.settings.rateTime);

    }, room.game.settings.fillTime);
}


export function attach_socket_server(
    server: HttpServer
) {
    const io = new Server<
        T.ClientToServerEvents,
        T.ServerToClientEvents,
        T.InterServerEvents,
        T.SocketData
    >(server);

    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            if (!socket.data.userId) {
                return;
            }

            const user = users.get(socket.data.userId);
            if (!user) {
                return;
            }

            for (const roomId of user.rooms) {
                const room = rooms.get(roomId);
                if (!room) {
                    continue;
                }
                removePlayerFromRoom(io, socket, user, room, user.id);
                io.sockets.sockets.get(user.socketId)?.leave(roomId);
                io.to(roomId).emit('player_disconnected', { playerId: user.id });
            }

            socket.data.userId = '';
            users.delete(user.id);
        });

        // socket.on('user_register', ({ user }) => {
        //     const userId = user.id;
        //     const _user: T.ServerUser = {
        //         id: userId,
        //         client: user,
        //         rooms: [],
        //         socketId: socket.id,
        //     };
        //     users.set(userId, _user);
        //     socket.data.userId = user.id;
        //     socket.emit('user_registered', { user: _user.client });
        // });

        // socket.on('user_unregister', ({ id }) => {
        //     const user = users.get(id);
        //     if (!user) {
        //         return;
        //     }

        //     for (const roomId of user.rooms) {
        //         const room = rooms.get(roomId);
        //         if (!room) {
        //             continue;
        //         }
        //         removePlayerFromRoom(io, socket, user, room, id);
        //     }

        //     users.delete(id);
        //     socket.data.userId = '';
        //     socket.emit('user_unregistered');
        // });

        socket.on('room_create', ({ roomId, user }) => {
            const userId = user.id;
            const _user: T.ServerUser = {
                id: userId,
                client: user,
                rooms: [],
                socketId: socket.id,
            };
            users.set(userId, _user);
            socket.data.userId = user.id;

            let room = rooms.get(roomId);
            if (!room) {
                const player: T.ServerPlayer = {
                    userId: _user.client.id,
                    roomId: roomId,
                    client: {
                        id: _user.client.id,
                        host: true,
                        name: _user.client.name,
                        role: PLAYER_ROLE.HOST,
                        score: 0,
                        scoreLast: 0,
                        scoreTotal: 0,
                        ready: false,
                        current: {
                            option: undefined,
                            freestyle: undefined,
                        },
                        stock: {
                            options: [],
                            modifiers: [],
                        },
                        used: {
                            freestyle: [],
                            options: [],
                            modifiers: [],
                        },
                        ratesReceived: {}
                    },
                };

                room = {
                    id: roomId,
                    room: {
                        id: roomId,
                        status: ROOM_STATUS.WAITING,
                        hostId: player.userId,
                        maxPlayers: GAME.MAX_PLAYERS
                    },
                    game: {
                        id: nanoid(),
                        roomId: roomId,
                        status: GAME_STATUS.NOT_STARTED,
                        settings: {
                            deckId: DEFAULT_DECK.id,
                            fillTime: GAME.DEFAULT_FILL_TIME,
                            rateTime: GAME.DEFAULT_RATE_TIME,
                            players: GAME.DEFAULT_PLAYERS,
                            rounds: GAME.DEFAULT_ROUNDS,
                            options: GAME.DEFAULT_OPTIONS,
                        },
                        round: 0,
                        deck: {
                            id: DEFAULT_DECK.id,
                            name: DEFAULT_DECK.name,
                            type: DEFAULT_DECK.type,
                        },
                        current: {
                            phrase: {
                                id: '',
                                text: '',
                            },
                            winner: '',
                        },
                        used: {
                            phrases: [],
                            options: [],
                        }

                    },
                    players: [player.client]
                };
            }

            _user.rooms.push(roomId);
            rooms.set(roomId, room);
            socket.join(roomId);
            socket.emit('room_created', {
                room: room.room,
                game: room.game,
                players: room.players
            });
        });

        socket.on('room_update', ({ room }) => {
            const _room = rooms.get(room.id);
            if (!_room) {
                return;
            }
            _room.room = room;

            io.to(room.id).emit('room_updated', { room: room });
        });

        socket.on('room_close', ({ roomId }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            if (!user || !room || room.room.hostId !== user.client.id) {
                return;
            }

            rooms.delete(roomId);
            io.to(roomId).emit('room_closed', { roomId });
            io.in(roomId).socketsLeave(roomId);
        });

        socket.on('room_join', ({ roomId, user }) => {
            const room = rooms.get(roomId);
            if (!room) {
                return;
            }

            if (room.players.length >= room.room.maxPlayers) {
                socket.emit('room_full', {
                    roomId: room.id,
                    maxPlayers: room.room.maxPlayers
                });
                return;
            }

            for (const player of room.players) {
                if (player.id === user.id) {
                    return;
                }
            }

            // for (const roomId of user.rooms) {
            //     const _room = rooms.get(roomId);
            //     if (_room) {
            //         return;
            //     }
            // }

            const userId = user.id;
            const _user: T.ServerUser = {
                id: userId,
                client: user,
                rooms: [],
                socketId: socket.id,
            };
            users.set(userId, _user);
            socket.data.userId = user.id;

            const player: T.Player = {
                id: user.id,
                host: false,
                name: user.name,
                role: PLAYER_ROLE.GUEST,
                score: 0,
                scoreLast: 0,
                scoreTotal: 0,
                ready: false,
                current: {
                    option: undefined,
                    freestyle: undefined,
                },
                stock: {
                    options: [],
                    modifiers: [],
                },
                used: {
                    freestyle: [],
                    options: [],
                    modifiers: [],
                },
                ratesReceived: {}
            };

            socket.join(roomId);
            _user.rooms.push(roomId);
            room.players.push(player);
            socket.emit('room_joined', {
                room: room.room,
                game: room.game,
                players: room.players
            });
            io.to(roomId).emit('player_joined', { player });
        });

        socket.on('room_leave', ({ roomId }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            if (!user || !room) {
                return;
            }

            removePlayerFromRoom(io, socket, user, room, user.id);

            socket.leave(room.room.id);
            socket.emit('room_left', { roomId: room.room.id });
            io.to(room.room.id).emit('player_left', { playerId: user.id });
        });

        socket.on('room_kick_player', ({ roomId, playerId }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            const kickedUser = users.get(playerId);
            if (!user || !room || !kickedUser) {
                return;
            }

            const userId = user.id;
            if (userId !== room.room.hostId || userId === playerId) {
                return;
            }

            removePlayerFromRoom(io, socket, kickedUser, room, playerId);
            io.to(room.room.id).emit('player_kicked', { playerId: playerId });
            io.sockets.sockets.get(kickedUser.socketId)?.leave(roomId);
        });

        socket.on('player_update', ({ roomId, player }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            if (!user || !room || user.id !== player.id) {
                return;
            }

            let playerIndex = -1;
            for (let i = 0; i < room.players.length; i++) {
                if (room.players[i].id === player.id) {
                    playerIndex = i;
                    break;
                }
            }
            if (playerIndex === -1) {
                return;
            }

            room.players[playerIndex] = player;
            io.to(roomId).emit('player_updated', { player: player });
        });

        socket.on('player_set_name', ({ roomId, name }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            if (!user || !room) {
                return;
            }

            let playerIndex = -1;
            for (let i = 0; i < room.players.length; i++) {
                if (room.players[i].id === user.id) {
                    playerIndex = i;
                    break;
                }
            }
            if (playerIndex === -1) {
                return;
            }

            const player = room.players[playerIndex];
            player.name = name;
            io.to(roomId).emit('player_updated', { player: player });
        });

        socket.on('player_set_ready', ({ roomId, state }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            if (!user || !room) {
                return;
            }

            let playerIndex = -1;
            for (let i = 0; i < room.players.length; i++) {
                if (room.players[i].id === user.id) {
                    playerIndex = i;
                    break;
                }
            }
            if (playerIndex === -1) {
                return;
            }

            const player = room.players[playerIndex];
            player.ready = state;
            io.to(roomId).emit('player_updated', { player: player });
        });

        socket.on('game_start', ({ roomId }) => {
            const room = rooms.get(roomId);
            if (!room || room.room.hostId !== socket.data.userId) {
                return;
            }

            setupNewGame(room);
            io.to(roomId).emit('game_started', { game: room.game, players: room.players });
            newRound(io, socket, room);
        });

        socket.on('game_set_settings', ({ roomId, settings }) => {
            const room = rooms.get(roomId);
            if (!room || room.room.hostId !== socket.data.userId) {
                return;
            }

            if (settings.deckId) {
                const deck = decks[settings.deckId];
                if (deck) {
                    room.game.settings.deckId = deck.id;
                    room.game.deck.id = deck.id;
                    room.game.deck.name = deck.name;
                    room.game.deck.type = deck.type;
                    room.game.deck.description = deck.description;
                }
            }
            if (settings.fillTime) {
                room.game.settings.fillTime = settings.fillTime;
            }
            if (settings.options) {
                room.game.settings.options = settings.options;
            }
            if (settings.players) {
                room.game.settings.players = settings.players;
            }
            if (settings.rateTime) {
                room.game.settings.rateTime = settings.rateTime;
            }
            if (settings.rounds) {
                room.game.settings.rounds = settings.rounds;
            }

            io.to(roomId).emit('game_updated', { game: room.game });
        });

        socket.on('game_set_freestyle', ({ roomId, freestyle }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            if (!user || !room) {
                return;
            }

            let playerIndex = -1;
            for (let i = 0; i < room.players.length; i++) {
                if (room.players[i].id === user.id) {
                    playerIndex = i;
                    break;
                }
            }
            if (playerIndex === -1) {
                return;
            }

            const player = room.players[playerIndex];
            player.current.freestyle = freestyle;
            socket.emit('player_updated', { player: player });
        });

        socket.on('game_set_option', ({ roomId, option }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            if (!user || !room) {
                return;
            }

            let playerIndex = -1;
            for (let i = 0; i < room.players.length; i++) {
                if (room.players[i].id === user.id) {
                    playerIndex = i;
                    break;
                }
            }
            if (playerIndex === -1) {
                return;
            }

            const player = room.players[playerIndex];
            player.current.option = option;
            socket.emit('player_updated', { player: player });
        });

        socket.on('game_rate_player', ({ roomId, playerId, rate }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            if (!user || !room) {
                return;
            }

            let playerIndex = -1;
            for (let i = 0; i < room.players.length; i++) {
                if (room.players[i].id === playerId) {
                    playerIndex = i;
                    break;
                }
            }
            if (playerIndex === -1) {
                return;
            }

            const player = room.players[playerIndex];
            player.ratesReceived[user.id] = rate;
        });
    });
}
