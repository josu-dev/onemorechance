import type { IncomingMessage, Server, ServerResponse } from "http";
import { customRandom, nanoid, random } from 'nanoid';
import { Server as SocketIOServer } from 'socket.io';
import * as T from './types.js';
import { GAME } from '../src/game/configs.js';
import { DECK_TYPE, GAME_STATUS, PLAYER_ROLE, ROOM_STATUS } from '../src/game/enums.js';

import importedDecks from '../static/decks/default.json' with { type: "json" };

const decks = importedDecks as Record<string, T.Deck>;

const DEFAULT_DECK = decks[GAME.DEFAULT_DECK_ID];


const randomRoomId = customRandom('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6, random);


const users = new Map<string, T.User>();

const rooms = new Map<string, T.Room>();


function newRound(io: T.WebSocketServer, socket: T.WebSocketServerSocket, room: T.Room) {
    room.game.round += 1;

    for (const player of room.players) {
        player.current.option = undefined;
        player.current.freestyle = undefined;
        player.score = 0;
    }

    const deck = decks[room.game.deck.id];

    let phrase = deck.phrases[Math.floor(Math.random() * deck.phrases.length)]!;
    while (room.game.used.phrases.includes(phrase.id)) {
        phrase = deck.phrases[Math.floor(Math.random() * deck.phrases.length)]!;
    }

    room.game.current.phrase = phrase;

    if (deck.type === DECK_TYPE.CHOOSE) {
        for (const player of room.players) {
            const missingOptions = room.game.maxOptions - player.stock.options.length;
            for (let i = 0; i < missingOptions; i++) {
                let option = deck.options[Math.floor(Math.random() * deck.options.length)]!;
                while (room.game.used.options.includes(option.id)) {
                    option = deck.options[Math.floor(Math.random() * deck.options.length)]!;
                }
                player.stock.options.push(option);
                room.game.used.options.push(option.id);
            }
        }
    }

    room.game.status = GAME_STATUS.FILL_SENTENCE;
    io.to(room.room.id).emit('game_updated', room.game);

    setTimeout(() => {
        room.game.status = GAME_STATUS.RATE_SENTENCE;
        io.to(room.room.id).emit('game_updated', room.game);

        const playerCount = room.players.length;
        for (let i = 0; i < playerCount; i++) {
            setTimeout(() => {
                const player = room.players[i];
                io.to(room.room.id).emit('rate_next_player', { playerId: player.id });
            }, i * GAME.DEFAULT_RATE_TIME);
        }

        setTimeout(() => {
            let winnerId = '';
            let winnerScore = -1;
            for (const player of room.players) {
                if (player.score > winnerScore) {
                    winnerId = player.id;
                    winnerScore = player.score;
                }
                player.totalScore += player.score;
            }
            room.game.current.winner = winnerId;
            room.game.status = GAME_STATUS.ROUND_WINNER;
            io.to(room.room.id).emit('game_updated', room.game);

            if (room.game.round < room.game.maxRounds) {
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
                io.to(room.room.id).emit('game_status_update', { status: room.game.status });

                setTimeout(() => {
                    room.game.status = GAME_STATUS.ENDED;
                    io.to(room.room.id).emit('game_updated', room.game);
                }, GAME.DEFAULT_SCOREBOARD_TIME);
            }, GAME.DEFAULT_RESULTS_TIME);
        }, room.players.length * GAME.DEFAULT_RATE_TIME);
    }, GAME.DEFAULT_SELECTION_TIME);
}


export function attach_sockets(
    server: Server<typeof IncomingMessage, typeof ServerResponse>
) {
    const io = new SocketIOServer<
    T.ClientToServerEvents,
    T.ServerToClientEvents,
    T.InterServerEvents,
    T.SocketData
    >(server);

    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            let user: T.User | undefined;
            for (const [, u] of users) {
                if (u.socketId === socket.id) {
                    user = u;
                    break;
                }
            }
            if (!user) return;
            let room: T.Room | undefined;
            for (const [, r] of rooms) {
                if (r.players.some(p => p.id === user!.id)) {
                    room = r;
                    break;
                }
            }
            if (room) {
                socket.leave(room.room.id);
                const playerIndex = room.players.findIndex(p => p.id === user!.id);
                if (playerIndex > -1) {
                    room.players.splice(playerIndex, 1);
                }
                if (room.players.length === 0) {
                    rooms.delete(room.room.id);
                } else {
                    if (room.room.hostId === user!.id) {
                        const hostPlayer = room.players[0];
                        hostPlayer.role = 'HOST';
                        room.room.hostId = hostPlayer.id;
                    }
                    io.to(room.room.id).emit('room_update', room.room);
                }
            }

            users.delete(user.id);
        });

        socket.on('register_user', ({ userId, name }) => {
            if (!userId) {
                userId = nanoid();
            }

            const user: T.User = {
                id: userId,
                name: name,
                socketId: socket.id,
            };
            users.set(userId, user);
            socket.emit('registered', user);
        });

        socket.on('unregister_user', ({ userId }) => {
            const user = users.get(userId);
            if (!user) return;

            users.delete(userId);
        });

        socket.on('create_room', ({ userId }) => {
            const user = users.get(userId);
            if (!user) return;

            const player: T.Client.Player = {
                id: user.id,
                name: user.name,
                role: 'HOST',
                score: 0,
                totalScore: 0,
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
                }
            };

            const roomId = randomRoomId();
            const room: T.Room = {
                room: {
                    id: roomId,
                status: ROOM_STATUS.IN_LOBBY,
                hostId: player.id,
                maxPlayers: GAME.MAX_PLAYERS
                },
                game: {
                    roomId: roomId,
                    status: GAME_STATUS.NOT_STARTED,
                    id: nanoid(),
                    maxRounds: GAME.DEFAULT_ROUNDS,
                    chooseTime: GAME.DEFAULT_SELECTION_TIME,
                    maxOptions: GAME.DEFAULT_OPTIONS,
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
                players: [player],
            };
            rooms.set(roomId, room);
            socket.join(roomId);
            socket.emit('room_create', room.room);
        });

        socket.on('update_room', ({ roomId, data }) => {
            const room = rooms.get(roomId);
            if (!room) return;
            room.room = data;

            io.to(roomId).emit('room_update', data);
        });

        socket.on('close_room', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            if (!room || room.room.hostId !== userId) {
                return;
            }

            rooms.delete(roomId);
            io.to(roomId).emit('room_close', { roomId });
        });

        socket.on('join_room', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            const user = users.get(userId);
            if (!room || !user) {
                return;
            }

            const player: T.Client.Player = {
                id: user.id,
                name: user.name,
                role: PLAYER_ROLE.GUEST,
                score: 0,
                totalScore: 0,
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
                }
            };

            socket.join(roomId);
            room.players.push(player);
            socket.emit('room_join', room.room);
            io.to(roomId).emit('player_join', { player });
        });

        socket.on('leave_room', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            const user = users.get(userId);
            if (!room || !user) {
                return;
            }

            const userIndex = room.players.findIndex(u => u.id === user!.id);
            if (userIndex > -1) {
                room.players.splice(userIndex, 1);
            }
            const playerIndex = room.players.findIndex(p => p.id === user!.id);
            if (playerIndex > -1) {
                room.players.splice(playerIndex, 1);
            }
            if (room.players.length === 0) {
                rooms.delete(room.room.id);
            } else {
                if (room.room.hostId === user!.id) {
                    const hostPlayer = room.players[0];
                    hostPlayer.role = PLAYER_ROLE.HOST;
                    room.room.hostId = hostPlayer.id;
                }
                io.to(room.room.id).emit('room_update', room.room);
            }

            socket.leave(room.room.id);
        });

        socket.on('kick_player', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            const user = users.get(userId);
            if (!room || !user || room.room.hostId !== socket.id) {
                return;
            }

            const userIndex = room.players.findIndex(u => u.id === user!.id);
            if (userIndex > -1) {
                room.players.splice(userIndex, 1);
            }
            const playerIndex = room.players.findIndex(p => p.id === user!.id);
            if (playerIndex > -1) {
                room.players.splice(playerIndex, 1);
            }
            io.to(room.room.id).emit('player_disconnect', user);
            // socket.leave(room.room.id);
            // TODO: Send a message to the kicked user
            // socket.emit('kicked_from_room', room);
        });

        socket.on('update_room_deck', ({ roomId, deckId }) => {
            const room = rooms.get(roomId);
            const deck = decks[deckId];
            if (!room || !deck) {
                return;
            }

            room.game.deck = {
                id: deck.id,
                name: deck.name,
                type: deck.type,
            };
            io.to(roomId).emit('game_deck_update', room.game.deck);
        });

        socket.on('player_ready', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            if (!room) return;

            const player = room.players.find(p => p.id === userId);
            if (!player) return;

            player.ready = true;
            io.to(roomId).emit('room_update', room.room);
        });

        socket.on('player_unready', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            if (!room) return;

            const player = room.players.find(p => p.id === userId);
            if (!player) return;

            player.ready = false;
            io.to(roomId).emit('room_update', room.room);
        });

        socket.on('start_game', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            if (!room || room.room.hostId !== userId) {
                return;
            }

            room.room.status = ROOM_STATUS.IN_GAME;
            room.game.status = GAME_STATUS.PRE_ROUND;
            room.game.round = 0;
            io.to(roomId).emit('game_started', room.game);
            newRound(io, socket, room);
        });

        socket.on('trigger_decks_update', () => {
            socket.emit('availible_decks_update', Object.values(decks).map(d => {
                return {
                    id: d.id,
                    name: d.name,
                    type: d.type as T.DeckType,
                };
            }));
        });

        socket.on('option_selected', ({ roomId, userId, option }) => {
            const room = rooms.get(roomId);
            const user = users.get(userId);
            if (!room || !user) {
                return;
            }

            const player = room.players.find(p => p.id === userId)!;
            player.current.option = option;
            socket.emit('player_updated', player);
        });

        socket.on('freestyle_selected', ({ roomId, userId, freestyle }) => {
            const room = rooms.get(roomId);
            const user = users.get(userId);
            if (!room || !user) {
                return;
            }

            const player = room.players.find(p => p.id === userId)!;
            player.current.freestyle = freestyle;
            socket.emit('player_updated', player);
        });

        socket.on('rate_player', ({ roomId, playerId, rate }) => {
            const room = rooms.get(roomId);
            if (!room) {
                return;
            }

            const player = room.players.find(p => p.id === playerId);
            if (!player) {
                return;
            }

            player.score += rate === 'BAD' ? -10 : rate === 'GOOD' ? 10 : 0;
            socket.emit('player_updated', player);
        });
    });
}
