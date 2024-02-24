import { and, eq, sql } from 'drizzle-orm';
import type { Server as HttpServer } from "http";
import type { Http2SecureServer } from "http2";
import { nanoid } from 'nanoid';
import { Server } from 'socket.io';
import { DECK_TYPE, GAME_STATUS, PLAYER_RATING, PLAYER_ROLE, ROOM_STATUS } from '../src/shared/constants.js';
import { GAME } from '../src/shared/defaults.js';
import { db, t } from './db.js';
import type * as T from './types.js';
import { log } from './utils.js';


export { log };

const DEFAULT_DECK: T.DeckFullCompact = {
    id: '',
    name: 'Unselected deck',
    type: DECK_TYPE.SELECT,
    description: 'This deck is not selected',
    userId: undefined,
    s: [],
    o: [],
};

const users = new Map<string, T.ServerUser>();

const rooms = new Map<string, T.ServerRoom>();

function removePlayerFromRoom(io: T.WebSocketServer, user: T.ServerUser, room: T.ServerRoom, playerId: string) {
    user.rooms.delete(room.room.id);

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
    room.game.used.sentences = [];
    room.game.current.sentence = {
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
    log.debug('New round', room.id, room.game.round, room.game.settings.rounds);
    room.game.round += 1;

    for (const player of room.players) {
        player.current.freestyle = undefined;
        player.current.modifier = undefined;
        player.current.option = undefined;
        player.scoreLast = player.score;
        player.score = 0;
        player.ratesReceived = {};
    }

    const deck = room.deck;

    const sentence = deck.s[(room.game.round - 1) % deck.s.length];
    if (room.game.round > deck.s.length) {
        room.game.used.sentences.length = 0;
        log.warn('Deck ran out of sentences', room.game, room.deck);
    }
    const sentenceSlotsCount = sentence.t.match(/{{.*?}}/g)?.length ?? 0;

    room.game.used.sentences.push(sentence.id);
    room.game.current.sentence = {
        id: sentence.id,
        text: sentence.t,
    };

    if (deck.type === DECK_TYPE.SELECT) {
        // TODO: Implement select deck
    }

    room.game.status = GAME_STATUS.FILL_SENTENCE;
    io.to(room.room.id).emit('game_updated_all', { game: room.game, players: room.players });

    setTimeout(() => {
        room.game.status = GAME_STATUS.RATE_SENTENCE;
        io.to(room.room.id).emit('game_updated_all', { game: room.game, players: room.players });

        const playerCount = room.players.length;
        const randomizedIds: string[] = [];
        for (let i = 0; i < playerCount; i++) {
            randomizedIds.push(room.players[i].id);
            const j = Math.floor(Math.random() * (i + 1));
            [randomizedIds[i], randomizedIds[j]] = [randomizedIds[j], randomizedIds[i]];
        }
        for (let i = 0; i < playerCount; i++) {
            setTimeout(
                (playerId) => {
                    io.to(room.room.id).emit('game_player_rated', { playerId: playerId });
                },
                i * room.game.settings.rateTime,
                randomizedIds[i]
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
                    GAME.DEFAULT_ROUND_WINNER_TIME,
                    io,
                    socket,
                    room
                );
                return;
            }

            setTimeout(() => {
                room.game.status = GAME_STATUS.GAME_WINNER;
                io.to(room.room.id).emit('game_status_updated', { status: room.game.status });

                setTimeout(async () => {
                    room.room.status = ROOM_STATUS.LOBBY_WAITING;
                    room.game.status = GAME_STATUS.NOT_STARTED;

                    io.to(room.room.id).emit('game_ended');

                    const promises: Promise<any>[] = [];
                    for (const player of room.players) {
                        promises.push(db
                            .update(t.users)
                            .set({
                                scoreLastGame: player.scoreTotal,
                                scoreLifetime: sql<number>`${t.users.scoreLifetime} + ${player.scoreTotal}`,
                            })
                            .where(eq(t.users.id, player.id))
                        );
                    }
                    await Promise.all(promises);
                }, GAME.DEFAULT_GAME_WINNER_TIME);

            }, GAME.DEFAULT_ROUND_WINNER_TIME);

        }, playerCount * room.game.settings.rateTime);

    }, room.game.settings.fillTime + sentenceSlotsCount * room.game.settings.fillTimeSlot);
}

function getPlayerFromRoom(room: T.ServerRoom, playerId: string): [T.Player | undefined, number] {
    for (let i = 0; i < room.players.length; i++) {
        if (room.players[i].id === playerId) {
            return [room.players[i], i];
        }
    }
    return [undefined, -1];
}

function queryDeck(deckId: string) {
    return db.select().from(t.decks).where(eq(t.decks.id, deckId)).get();
}

export function attach_socket_server(server: HttpServer | Http2SecureServer) {
    const io = new Server<
        T.ClientToServerEvents,
        T.ServerToClientEvents,
        T.InterServerEvents,
        T.SocketData
    >(server);

    io.on('connection', async (socket) => {
        // @ts-ignore - If you don't need this reference, you can discard it in order to reduce the memory footprint:
        delete socket.conn.request;
        const handshakeUserId: string | undefined = socket.handshake.auth.userId;

        const dbUser = handshakeUserId && await db.select().from(t.users).where(eq(t.users.id, handshakeUserId)).get();
        if (!dbUser) {
            log.error('User not found', socket.handshake.auth.userId);
            socket.timeout(1000).emit(
                'unauthorized',
                { error: 'User not found' },
                (err, ok) => {
                    log.debug('Unauthorized disconnect', socket.handshake.auth.userId, err, ok);
                    if (err) {
                        log.error('Error disconnecting unauthorized user', socket.handshake.auth.userId);
                    }
                    socket.disconnect(true);
                });
            return;
        }

        log.debug('Client connected', socket.id, 'user', dbUser.id);

        socket.data.userId = dbUser.id;
        users.set(dbUser.id, {
            id: dbUser.id,
            client: dbUser,
            rooms: new Set(),
            socketId: socket.id,
        });

        socket.on('disconnect', async () => {
            log.debug('Client disconnected', socket.id, 'user', socket.data.userId);
            if (!socket.data.userId) {
                return;
            }

            const user = users.get(socket.data.userId);
            if (!user) {
                return;
            }

            socket.data.userId = '';
            users.delete(user.id);

            for (const roomId of user.rooms) {
                const room = rooms.get(roomId);
                if (!room) {
                    continue;
                }

                log.debug('User removed from room', roomId, user.id);
                removePlayerFromRoom(io, user, room, user.id);
                socket.leave(roomId);
                io.to(roomId).emit('player_disconnected', { playerId: user.id });
                if (room.players.length === 0) {
                    await db.delete(t.rooms).where(eq(t.rooms.id, roomId));
                }
                else {
                    await db.delete(t.usersToRooms).where(and(
                        eq(t.usersToRooms.userId, user.id),
                        eq(t.usersToRooms.roomId, roomId)
                    ));
                }
            }
        });

        socket.on('room_create', async ({ roomId }) => {
            const user = users.get(socket.data.userId);
            if (!user) {
                log.error('User not found', dbUser.id);
                socket.emit('room_error', { ev: 'room_create', err: 'user not found' });
                return;
            }
            const dbRoom = await db.select().from(t.rooms).where(eq(t.rooms.id, roomId)).get();
            if (!dbRoom) {
                log.debug(`Room create failed, room ${roomId} not found`);
                socket.emit('room_error', { ev: 'room_create', err: 'room not found' });
                return;
            }

            log.debug('Room create', roomId, dbUser);
            user.rooms.add(roomId);
            let room = rooms.get(roomId);
            if (!room) {
                const player: T.Player = {
                    id: user.id,
                    host: true,
                    name: user.client.name,
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
                };

                room = {
                    id: roomId,
                    room: {
                        id: roomId,
                        status: ROOM_STATUS.LOBBY_WAITING,
                        hostId: player.id,
                        maxPlayers: GAME.MAX_PLAYERS
                    },
                    game: {
                        id: nanoid(),
                        roomId: roomId,
                        status: GAME_STATUS.NOT_STARTED,
                        settings: {
                            deckId: DEFAULT_DECK.id,
                            fillTime: GAME.DEFAULT_FILL_TIME_BASE,
                            fillTimeSlot: GAME.DEFAULT_FILL_TIME_SLOT,
                            rateTime: GAME.DEFAULT_RATE_TIME,
                            players: GAME.DEFAULT_PLAYERS,
                            rounds: GAME.DEFAULT_ROUNDS,
                            options: GAME.DEFAULT_OPTIONS,
                        },
                        round: 0,
                        deck: structuredClone(DEFAULT_DECK),
                        current: {
                            sentence: {
                                id: '',
                                text: '',
                            },
                            winner: '',
                        },
                        used: {
                            sentences: [],
                            options: [],
                        }

                    },
                    players: [player],
                    deck: structuredClone(DEFAULT_DECK)
                };

                rooms.set(roomId, room);
            }

            socket.join(roomId);
            socket.emit('room_created', {
                room: room.room,
                game: room.game,
                players: room.players
            });
        });

        socket.on('room_close', async ({ roomId }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            if (!user || !room) {
                log.debug(`Room close failed, room ${roomId} or user ${user?.id} not found`);
                return;
            }
            if (user.id !== room.room.hostId) {
                log.debug(`Room close failed, user ${user.id} is not the host of room ${roomId}`);
                socket.emit('room_error', { ev: 'room_close', err: 'not the host' });
                return;
            }

            user.rooms.delete(roomId);
            rooms.delete(roomId);
            io.to(roomId).emit('room_closed', { roomId });
            io.in(roomId).socketsLeave(roomId);
            await db.delete(t.rooms).where(eq(t.rooms.id, roomId));
        });

        socket.on('room_join', async ({ roomId }) => {
            const room = rooms.get(roomId);
            const user = users.get(socket.data.userId);
            if (!room || !user) {
                log.debug(`Room join failed, room ${roomId} not found`);
                socket.emit('room_error', { ev: 'room_join', err: 'room not found' });
                return;
            }
            if (room.players.length >= room.room.maxPlayers) {
                log.debug(`Room join failed, room ${roomId} is full`);
                socket.emit('room_full', {
                    roomId: room.id,
                    maxPlayers: room.room.maxPlayers
                });
                return;
            }

            const usersInRoom = await (db
                .select({ id: t.usersToRooms.userId })
                .from(t.usersToRooms)
                .where(eq(t.usersToRooms.roomId, room.id))
            );
            let userInRoom = false;
            for (const u of usersInRoom) {
                if (u.id === user.id) {
                    userInRoom = true;
                    break;
                }
            }
            if (!userInRoom) {
                if (usersInRoom.length >= room.room.maxPlayers) {
                    log.debug(`Room join failed, room ${roomId} is full`);
                    socket.emit('room_full', {
                        roomId: room.id,
                        maxPlayers: room.room.maxPlayers
                    });
                    return;
                }

                await db.insert(t.usersToRooms).values({
                    userId: user.id,
                    roomId: room.id,
                });
            }

            log.debug('Room join', roomId, user.id);
            for (const player of room.players) {
                if (player.id === user.id) {
                    log.debug('User already in room', roomId, user.id);
                    socket.emit('room_joined', {
                        room: room.room,
                        game: room.game,
                        players: room.players
                    });
                    return;
                }
            }

            const player: T.Player = {
                id: user.id,
                host: false,
                name: user.client.name,
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
            user.rooms.add(roomId);
            room.players.push(player);
            socket.emit('room_joined', {
                room: room.room,
                game: room.game,
                players: room.players
            });
            io.to(roomId).emit('player_joined', { player });
        });

        socket.on('room_leave', async ({ roomId }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            if (!user || !room) {
                log.debug(`Room leave failed, room ${roomId} or user ${user?.id} not found`);
                socket.emit('room_error', { ev: 'room_leave', err: 'room not found' });
                return;
            }

            log.debug('Room leave', roomId, user.id);
            removePlayerFromRoom(io, user, room, user.id);

            socket.leave(room.room.id);
            socket.emit('room_left', { roomId: room.room.id });
            io.to(room.room.id).emit('player_left', { playerId: user.id });
            if (room.players.length === 0) {
                await db.delete(t.rooms).where(eq(t.rooms.id, roomId));
            }
            else {
                await db.delete(t.usersToRooms).where(and(
                    eq(t.usersToRooms.userId, user.id),
                    eq(t.usersToRooms.roomId, room.id)
                ));
            }
        });

        socket.on('room_kick_player', async ({ roomId, playerId }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            if (!user || !room) {
                log.debug(`Room kick player failed, room ${roomId} or user ${user?.id} not found`);
                return;
            }
            const kickedUser = users.get(playerId);
            if (!kickedUser) {
                return;
            }

            if (user.id !== room.room.hostId) {
                log.debug(`Room kick player failed, user ${user.id} is not the host of room ${roomId}`);
                socket.emit('room_error', { ev: 'room_kick_player', err: 'not the host' });
                return;
            }

            log.debug(`Room kick player ${playerId} from room ${roomId} by user ${user.id}`);
            removePlayerFromRoom(io, kickedUser, room, playerId);
            io.to(room.room.id).emit('player_kicked', { playerId: playerId });
            io.sockets.sockets.get(kickedUser.socketId)?.leave(roomId);
            await db.delete(t.usersToRooms).where(and(
                eq(t.usersToRooms.userId, kickedUser.id),
                eq(t.usersToRooms.roomId, room.id)
            ));
        });

        socket.on('player_update', ({ roomId, player }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            if (!user || !room) {
                log.debug(`Player update failed room ${roomId} or user ${user?.id} not found`);
                socket.emit('room_error', { ev: 'player_update', err: 'room or user not found' });
                return;
            }

            const [roomPlayer] = getPlayerFromRoom(room, user.id);
            if (!roomPlayer) {
                log.debug(`Player update failed room ${roomId} player ${user.id} not found`);
                socket.emit('room_error', { ev: 'player_update', err: 'player not found' });
                return;
            }

            log.debug('Player update', roomId, player.id);
            Object.assign(roomPlayer, player);
            io.to(roomId).emit('player_updated', { player: roomPlayer });
        });

        socket.on('player_set_ready', ({ roomId, state }) => {
            const user = users.get(socket.data.userId);
            const room = rooms.get(roomId);
            if (!user || !room) {
                log.debug(`Player set ready failed room ${roomId} or user ${user?.id} not found`);
                socket.emit('room_error', { ev: 'player_set_ready', err: 'room or user not found' });
                return;
            }

            const [roomPlayer] = getPlayerFromRoom(room, user.id);
            if (!roomPlayer) {
                log.debug(`Player set ready failed room ${roomId} player ${user.id} not found`);
                socket.emit('room_error', { ev: 'player_set_ready', err: 'player not found' });
                return;
            }

            roomPlayer.ready = state;
            io.to(roomId).emit('player_updated', { player: roomPlayer });
        });

        socket.on('room_start_game', async ({ roomId }) => {
            const room = rooms.get(roomId);
            if (!room || room.room.hostId !== socket.data.userId) {
                log.debug(`Game start failed (not host) room ${roomId} user ${socket.data.userId}`);
                socket.emit('room_error', { ev: 'room_start_game', err: 'not the host' });
                return;
            }

            const deckId = room.game.settings.deckId;
            const deckQuery = (db
                .select()
                .from(t.decks)
                .where(eq(t.decks.id, deckId))
                .get()
            );
            const sentencesQuery = (db
                .select({ id: t.sentences.id, t: t.sentences.text })
                .from(t.sentences)
                .where(eq(t.sentences.deckId, deckId))
                .orderBy(sql`random()`)
                .limit(room.game.settings.rounds * 2)
            );
            const [d, s] = await Promise.all([deckQuery, sentencesQuery]);
            if (!d) {
                log.debug(`Game start failed (deck not found) room ${roomId} user ${socket.data.userId}`);
                socket.emit('room_error', { ev: 'room_start_game', err: 'deck not found' });
                return;
            }

            log.debug('Game start', roomId, socket.data.userId);
            room.deck.id = d.id;
            room.deck.type = d.type;
            room.deck.s = s;

            room.game.deck.id = d.id;
            room.game.deck.name = d.name;
            room.game.deck.type = d.type;
            room.game.deck.description = d.description;
            room.game.deck.userId = d.userId ?? undefined;

            setupNewGame(room);
            io.to(roomId).emit('game_started', { game: room.game, players: room.players });
            newRound(io, socket, room);
        });

        socket.on('game_set_settings', async ({ roomId, settings }) => {
            const room = rooms.get(roomId);
            if (!room || room.room.hostId !== socket.data.userId) {
                log.debug(`Game set settings failed (not host) room ${roomId} user ${socket.data.userId}`);
                socket.emit('game_error', { ev: 'game_set_settings', err: 'not the host' });
                return;
            }

            log.debug('Game set settings', roomId, socket.data.userId, settings);
            if (settings.deckId) {
                const deck = await queryDeck(settings.deckId);
                if (deck) {
                    room.deck.id = settings.deckId;
                    room.deck.type = deck.type;
                    room.game.settings.deckId = settings.deckId;
                    room.game.deck.id = deck.id;
                    room.game.deck.name = deck.name;
                    room.game.deck.type = deck.type;
                    room.game.deck.description = deck.description;
                    room.game.deck.userId = deck.userId ?? undefined;
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
            const room = rooms.get(roomId);
            if (!room) {
                log.debug(`Game set freestyle failed room ${roomId} user ${socket.data.userId}`);
                socket.emit('game_error', { ev: 'game_set_freestyle', err: 'room not found' });
                return;
            }

            const userId = socket.data.userId;
            const [player] = getPlayerFromRoom(room, userId);
            if (!player) {
                log.debug(`Game set freestyle failed user ${userId} not found in room ${roomId}`);
                socket.emit('game_error', { ev: 'game_set_freestyle', err: 'player not found' });
                return;
            }

            player.current.freestyle = freestyle;
            socket.emit('player_updated', { player: player });
        });

        socket.on('game_set_option', ({ roomId, option }) => {
            const room = rooms.get(roomId);
            if (!room) {
                log.debug(`Game set option failed room ${roomId} user ${socket.data.userId}`);
                socket.emit('game_error', { ev: 'game_set_option', err: 'room not found' });
                return;
            }

            const userId = socket.data.userId;
            const [player] = getPlayerFromRoom(room, userId);
            if (!player) {
                log.debug(`Game set option failed user ${userId} not found in room ${roomId}`);
                socket.emit('game_error', { ev: 'game_set_option', err: 'player not found' });
                return;
            }

            player.current.option = option;
            socket.emit('player_updated', { player: player });
        });

        socket.on('game_rate_player', ({ roomId, playerId, rate }) => {
            const room = rooms.get(roomId);
            if (!room) {
                log.debug(`Game rate player failed room ${roomId} user ${socket.data.userId}`);
                socket.emit('game_error', { ev: 'game_rate_player', err: 'room not found' });
                return;
            }

            const userId = socket.data.userId;
            const [player] = getPlayerFromRoom(room, userId);
            const [targetPlayer] = getPlayerFromRoom(room, playerId);
            if (!player || !targetPlayer) {
                log.debug(`Game rate player failed user ${userId} or target ${playerId} not found in room ${roomId}`);
                socket.emit('game_error', { ev: 'game_rate_player', err: 'player not found' });
                return;
            }

            log.debug(`Game rate ${rate} player ${playerId} by user ${userId} in room ${roomId}`);
            targetPlayer.ratesReceived[player.id] = rate;
        });

        socket.emit('connect_ready');
    });
}
