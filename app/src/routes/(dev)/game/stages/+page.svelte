<script lang="ts">
  import { debugData } from '$comps/HyperDebug.svelte';
  import RoomLobby from '$comps/game/RoomLobby.svelte';
  import {
    availibleDecks as availableDecks,
    game,
    players,
    room,
    user,
  } from '$lib/dev/state.js';
  import type { GameStatus } from '$lib/enums.js';
  import { GAME_STATUS } from '$lib/enums.js';
  import { onMount } from 'svelte';
  import { helpers } from 'svelte-hypercommands/CommandPalette.svelte';
  import * as _state from './state.js';

  // export let data;

  onMount(() => {
    debugData.set(room);

    const cmdCleanup = helpers.registerCommand([
      ...Object.keys(GAME_STATUS).map((key) => ({
        category: 'Game Status',
        name: key.toLowerCase().split('_').join(' '),
        description: `Set game status to ${key}`,
        onAction: () => {
          _state.setGameStatus(GAME_STATUS[key as GameStatus]);
        },
      })),
      {
        name: 'Toggle player role',
        description: "Toggle current player's role",
        onAction: () => {
          const _user = user.value;
          const _room = room.value;
          if (!_user || !_room) return;
          _user.id = _user.id === '1' ? '3' : '1';
          user.sync();
        },
      },
    ]);

    return () => {
      cmdCleanup();
    };
  });

  $: gameStatus = $game.status;
  $: isHost = $user?.id === $room?.host.id;
  $: isNotStarted = gameStatus === GAME_STATUS.NOT_STARTED;

  let rounds = 0;
  let timer = 0;
  let numOptions = 0;

  function startGame(event: SubmitEvent) {
    event.preventDefault();
  }
  function confirmPlayer(checked: boolean) {
    console.log(checked);
  }
  function copyRoomCode() {
    console.log('copied');
  }

  const _user = user as any;
  const _room = room as any;
</script>

<main
  class="h-full flex flex-col items-center justify-center overflow-y-auto p-1 ring-1 ring-cyan-500 md:ring-fuchsia-500 ring-inset"
>
  <h1 class="sr-only">A jugar One More Chance!</h1>
  {#if !$room || !$user}
    <h2 class="text-4xl text-white font-bold text-center">
      Room not found, you shouldnt be seeing this 😅
    </h2>
  {:else if isNotStarted}
    <RoomLobby user={_user} room={_room} {game} {players} {availableDecks} />
  {/if}
</main>
