import type { IncomingMessage, Server, ServerResponse } from "http";
import { customRandom, nanoid, random } from 'nanoid';
import { Socket, Server as ioServer } from "socket.io";
import { GAME } from '../src/lib/configs.js';
import { DECK_TYPE, GAME_STATUS, ROOM_STATUS, type DeckType } from '../src/lib/enums.js';
import type {
    ClientToServerEvents,
    Deck,
    InterServerEvents,
    Player,
    Room,
    ServerToClientEvents,
    SocketData,
    User
} from "../src/types.js";

import importedDecks from '../static/decks/default.json' with { type: "json" };

const decks = importedDecks as Record<string, Deck>;

const DEFAULT_DECK = decks[GAME.DEFAULT_DECK_ID];


const randomRoomId = customRandom('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6, random);


const users = new Map<string, User>();

const rooms = new Map<string, Room>();


type _IoServer = ioServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
>;

type _Socket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;


function newRound(io: _IoServer, socket: _Socket, room: Room) {
    room.game.round += 1;

    for (const player of room.game.players) {
        player.selectedOption = undefined;
        player.freestyle = undefined;
        player.score = 0;
    }

    const deck = decks[room.game.deck.id];

    let phrase = deck.phrases[Math.floor(Math.random() * deck.phrases.length)]!;
    while (room.game.usedPhrases.includes(phrase.id)) {
        phrase = deck.phrases[Math.floor(Math.random() * deck.phrases.length)]!;
    }

    room.game.phrase = phrase;

    if (deck.type === DECK_TYPE.CHOOSE) {
        for (const player of room.game.players) {
            const missingOptions = room.game.maxOptions - player.options.length;
            for (let i = 0; i < missingOptions; i++) {
                let option = deck.options[Math.floor(Math.random() * deck.options.length)]!;
                while (room.game.usedOptions.includes(option.id)) {
                    option = deck.options[Math.floor(Math.random() * deck.options.length)]!;
                }
                player.options.push(option);
                room.game.usedOptions.push(option.id);
            }
        }
    }

    room.game.status = GAME_STATUS.FILL_SENTENCE;
    io.to(room.id).emit('game_updated', room.game);

    setTimeout(() => {
        room.game.status = GAME_STATUS.RATE_SENTENCE;
        io.to(room.id).emit('game_updated', room.game);

        const playerCount = room.game.players.length;
        for (let i = 0; i < playerCount; i++) {
            setTimeout(() => {
                const player = room.game.players[i];
                io.to(room.id).emit('rate_next_player', { playerId: player.userId });
            }, i * GAME.DEFAULT_RATE_TIME);
        }

        setTimeout(() => {
            let winnerId = '';
            let winnerScore = -1;
            for (const player of room.game.players) {
                if (player.score > winnerScore) {
                    winnerId = player.userId;
                    winnerScore = player.score;
                }
                player.totalScore += player.score;
            }
            room.game.lastWinner = winnerId;
            room.game.status = GAME_STATUS.ROUND_WINNER;
            io.to(room.id).emit('game_updated', room.game);

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
                room.game.status = GAME_STATUS.SCOREBOARD;
                io.to(room.id).emit('game_status_update', { status: room.game.status });

                setTimeout(() => {
                    room.game.status = GAME_STATUS.ENDED;
                    io.to(room.id).emit('game_updated', room.game);
                }, GAME.DEFAULT_SCOREBOARD_TIME);
            }, GAME.DEFAULT_RESULTS_TIME);
        }, room.game.players.length * GAME.DEFAULT_RATE_TIME);
    }, GAME.DEFAULT_SELECTION_TIME);
}


export function attach_sockets(
    server: Server<typeof IncomingMessage, typeof ServerResponse>
) {
    const io = new ioServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >(server);

    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            let user: User | undefined;
            for (const [, u] of users) {
                if (u.socketId === socket.id) {
                    user = u;
                    break;
                }
            }
            if (!user) return;
            let room: Room | undefined;
            for (const [, r] of rooms) {
                if (r.users.includes(user)) {
                    room = r;
                    break;
                }
            }
            if (room) {
                socket.leave(room.id);
                const userIndex = room.users.findIndex(u => u.id === user!.id);
                if (userIndex > -1) {
                    room.users.splice(userIndex, 1);
                }
                const playerIndex = room.game.players.findIndex(p => p.userId === user!.id);
                if (playerIndex > -1) {
                    room.game.players.splice(playerIndex, 1);
                }
                if (room.users.length === 0) {
                    rooms.delete(room.id);
                } else {
                    if (room.host.id === user!.id) {
                        room.host = room.users[0];
                        const hostPlayer = room.game.players.find(p => p.userId === room!.host.id)!;
                        hostPlayer.role = 'HOST';
                    }
                    io.to(room.id).emit('updated_room', room);
                }
            }

            users.delete(user.id);
        });

        socket.on('register_user', ({ userId, name }) => {
            if (!userId) {
                userId = nanoid();
            }

            const user: User = {
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

            const player: Player = {
                userId: user.id,
                name: user.name,
                role: 'HOST',
                score: 0,
                totalScore: 0,
                ready: false,
                modifiers: [],
                options: [],
                phrases: [],
            };

            const roomId = randomRoomId();
            const room: Room = {
                id: roomId,
                status: ROOM_STATUS.LOBBY,
                host: user,
                users: [user],
                readyCount: 0,
                game: {
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
                    phrase: {
                        id: 'default',
                        text: 'Default'
                    },
                    usedPhrases: [],
                    usedOptions: [],
                    players: [player],
                }
            };
            rooms.set(roomId, room);
            socket.join(roomId);
            socket.emit('created_room', room);
        });

        socket.on('update_room', ({ roomId, data }) => {
            const room = rooms.get(roomId);
            if (!room) return;

            rooms.set(roomId, data);
            io.to(roomId).emit('updated_room', data);
        });

        socket.on('close_room', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            if (!room || room.host.id !== userId) {
                return;
            }

            rooms.delete(roomId);
            io.to(roomId).emit('closed_room', { roomId });
        });

        socket.on('join_room', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            const user = users.get(userId);
            if (!room || !user) {
                return;
            }

            const player: Player = {
                userId: user.id,
                name: user.name,
                role: 'INVITED',
                score: 0,
                totalScore: 0,
                ready: false,
                modifiers: [],
                options: [],
                phrases: [],
            };

            socket.join(roomId);
            room.users.push(user);
            room.game.players.push(player);
            socket.emit('joined_room', room);
            io.to(roomId).emit('user_join_room', { user, player });
        });

        socket.on('leave_room', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            const user = users.get(userId);
            if (!room || !user) {
                return;
            }

            const userIndex = room.users.findIndex(u => u.id === user!.id);
            if (userIndex > -1) {
                room.users.splice(userIndex, 1);
            }
            const playerIndex = room.game.players.findIndex(p => p.userId === user!.id);
            if (playerIndex > -1) {
                room.game.players.splice(playerIndex, 1);
            }
            if (room.users.length === 0) {
                rooms.delete(room.id);
            } else {
                if (room.host.id === user!.id) {
                    room.host = room.users[0];
                    const hostPlayer = room.game.players.find(p => p.userId === room!.host.id)!;
                    hostPlayer.role = 'HOST';
                }
                io.to(room.id).emit('updated_room', room);
            }

            socket.leave(room.id);
        });

        socket.on('kick_player', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            const user = users.get(userId);
            if (!room || !user || room.host.id !== socket.id) {
                return;
            }

            const userIndex = room.users.findIndex(u => u.id === user!.id);
            if (userIndex > -1) {
                room.users.splice(userIndex, 1);
            }
            const playerIndex = room.game.players.findIndex(p => p.userId === user!.id);
            if (playerIndex > -1) {
                room.game.players.splice(playerIndex, 1);
            }
            io.to(room.id).emit('user_left_room', user);
            // socket.leave(room.id);
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

            const player = room.game.players.find(p => p.userId === userId);
            if (!player) return;

            player.ready = true;
            room.readyCount += 1;
            io.to(roomId).emit('updated_room', room);
        });

        socket.on('player_unready', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            if (!room) return;

            const player = room.game.players.find(p => p.userId === userId);
            if (!player) return;

            player.ready = false;
            room.readyCount -= 1;
            io.to(roomId).emit('updated_room', room);
        });

        socket.on('start_game', ({ roomId, userId }) => {
            const room = rooms.get(roomId);
            if (!room || room.host.id !== userId) {
                return;
            }

            room.readyCount = 0;
            room.status = ROOM_STATUS.PLAYING;
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
                    type: d.type as DeckType,
                };
            }));
        });

        socket.on('option_selected', ({ roomId, userId, option }) => {
            const room = rooms.get(roomId);
            const user = users.get(userId);
            if (!room || !user) {
                return;
            }

            const player = room.game.players.find(p => p.userId === userId)!;
            player.selectedOption = option;
            socket.emit('player_updated', player);
        });

        socket.on('freestyle_selected', ({ roomId, userId, freestyle }) => {
            const room = rooms.get(roomId);
            const user = users.get(userId);
            if (!room || !user) {
                return;
            }

            const player = room.game.players.find(p => p.userId === userId)!;
            player.freestyle = freestyle;
            socket.emit('player_updated', player);
        });

        socket.on('rate_player', ({ roomId, playerId, rate }) => {
            const room = rooms.get(roomId);
            if (!room) {
                return;
            }

            const player = room.game.players.find(p => p.userId === playerId);
            if (!player) {
                return;
            }

            player.score += rate === 'BAD' ? -10 : rate === 'GOOD' ? 10 : 0;
            socket.emit('player_updated', player);
        });
    });
}
