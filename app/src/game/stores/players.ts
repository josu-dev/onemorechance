import type { GameStateStore, Player, SelfStore, SocketStore } from '$game/types.js';
import { log } from '$lib/utils/clientside.ts';
import { writable } from 'svelte/store';


export type PlayerClient = Player & {
    me: boolean,
};

function defaultPlayers(): PlayerClient[] {
    return [];
}

export type PlayersStore = GameStateStore<PlayerClient[]> & {
    add(player: Player): void,
    remove(playerId: string): void,
    update(player: Player): void,
};

export function createPlayersStore(self: SelfStore): PlayersStore {
    let _players: PlayerClient[] = defaultPlayers();

    const { subscribe, set } = writable<PlayerClient[]>(_players);

    let selfId = self.value.user.id;

    self.subscribe((value) => {
        if (selfId === value.user.id) {
            return;
        }

        selfId = value.user.id;
        for (let i = 0; i < _players.length; i++) {
            _players[i].me = _players[i].id === selfId;
        }
        set(_players);
    });

    return {
        subscribe,
        get value() {
            return _players;
        },
        mset(value) {
            for (const player of value) {
                let found = false;
                for (let i = 0; i < _players.length; i++) {
                    if (_players[i].id === player.id) {
                        Object.assign(_players[i], player);
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    _players.push({ ...player as Player, me: player.id === selfId });
                }
            }
            for (let i = 0; i < _players.length; i++) {
                _players[i].me = _players[i].id === selfId;
                if (_players[i].me) {
                    self.value.player = _players[i];
                    self.sync();
                }
            }
            set(_players);
        },
        sync() {
            set(_players);
        },
        reset() {
            _players = defaultPlayers();
            set(_players);
        },
        add(player) {
            if (player.id === selfId) {
                return;
            }

            for (let i = 0; i < _players.length; i++) {
                if (_players[i].id === player.id) {
                    return;
                }
            }

            _players.push({ ...player, me: player.id === selfId });
            set(_players);
        },
        remove(playerId) {
            let foundIndex = -1;
            for (let i = 0; i < _players.length; i++) {
                if (_players[i].id === playerId) {
                    foundIndex = i;
                    break;
                }
            }
            if (foundIndex === -1) {
                return;
            }

            _players.splice(foundIndex, 1);
            set(_players);
        },
        update(player) {
            let foundIndex = -1;
            for (let i = 0; i < _players.length; i++) {
                if (_players[i].id === player.id) {
                    foundIndex = i;
                    break;
                }
            }
            if (foundIndex === -1) {
                return;
            }

            Object.assign(_players[foundIndex], player);
            _players[foundIndex].me = player.id === selfId;
            set(_players);
        },
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createPlayersActions(socket: SocketStore, players: PlayersStore) {
    return {};
}

export function attachPlayersListeners(socket: SocketStore, players: PlayersStore) {
    socket.instance.on('player_joined', (data) => {
        log.debug('player_joined', data);
        players.add(data.player);
    });

    socket.instance.on('player_left', (data) => {
        log.debug('player_left', data);
        players.remove(data.playerId);
    });

    socket.instance.on('player_disconnected', (data) => {
        log.debug('player_disconnected', data);
        players.remove(data.playerId);
    });
}
