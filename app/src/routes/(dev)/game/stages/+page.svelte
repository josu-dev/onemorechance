<script lang="ts">
  import { debugData } from '$comps/HyperDebug.svelte';
  import GameFillSentence from '$comps/game/GameFillSentence.svelte';
  import GameLobby from '$comps/game/GameLobby.svelte';
  import GameRateSentence from '$comps/game/GameRateSentence.svelte';
  import GameScoreboard from '$comps/game/GameScoreboard.svelte';
  import { GAME } from '$lib/configs.js';
  import {
    availibleDecks as availableDecks,
    game,
    players,
    room,
    setGameStatus,
    user,
  } from '$lib/dev/state.js';
  import type { GameStatus } from '$lib/enums.js';
  import { GAME_STATUS } from '$lib/enums.js';
  import { onMount } from 'svelte';
  import { helpers } from 'svelte-hypercommands/CommandPalette.svelte';

  // export let data;

  function emulateRateSentence() {
    setGameStatus(GAME_STATUS.RATE_SENTENCE);

    for (let i = 0; i < $game.players.length; i++) {
      setTimeout(
        (id) => {
          game.value.ratingPlayer = id;
          game.sync();
        },
        i * GAME.DEFAULT_RATE_TIME,
        $game.players[i].userId,
      );
    }
  }

  onMount(() => {
    debugData.set(room);
    // setGameStatus(GAME_STATUS.FILL_SENTENCE);

    const cmdCleanup = helpers.registerCommand([
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
      {
        category: 'GS',
        name: 'Not Started',
        description: `Set game status to ${GAME_STATUS.NOT_STARTED}`,
        onAction: () => {
          setGameStatus(GAME_STATUS.NOT_STARTED);
        },
      },
      {
        category: 'GS',
        name: 'Fill Sentence',
        description: `Set game status to ${GAME_STATUS.FILL_SENTENCE}`,
        onAction: () => {
          setGameStatus(GAME_STATUS.FILL_SENTENCE);
        },
      },
      {
        category: 'GS',
        name: 'Rate Sentence',
        description: `Set game status to ${GAME_STATUS.RATE_SENTENCE}`,
        onAction: emulateRateSentence,
      },
    ]);

    return () => {
      cmdCleanup();
    };
  });

  $: pageTitle = `${
    $room?.status === 'PLAYING' ? 'Jugando' : 'Esperando'
  } - One More Chance`;

  $: isHost = $user?.id === $room?.host.id;

  let gameStatus: GameStatus = GAME_STATUS.NOT_STARTED;

  $: if (gameStatus !== $game.status) {
    gameStatus = $game.status;
  }
  $: isNotStarted = gameStatus === GAME_STATUS.NOT_STARTED;
  $: isPreRound = gameStatus === GAME_STATUS.PRE_ROUND;
  $: isFillSentence = gameStatus === GAME_STATUS.FILL_SENTENCE;
  $: isRateSentence = gameStatus === GAME_STATUS.RATE_SENTENCE;
  $: isRoundWinner = gameStatus === GAME_STATUS.ROUND_WINNER;
  $: isPostRound = gameStatus === GAME_STATUS.POS_ROUND;
  $: isScoreboard = gameStatus === GAME_STATUS.SCOREBOARD;
  $: isEnded = gameStatus === GAME_STATUS.ENDED;

  const _user = user as any;
  const _room = room as any;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<main
  class="h-full flex flex-col items-center justify-center overflow-y-auto p-1 ring-1 ring-cyan-500 md:ring-fuchsia-500 ring-inset"
>
  <h1 class="sr-only">A jugar One More Chance!</h1>
  {#if !$room || !$user}
    <h2 class="text-4xl text-white font-bold text-center">
      Room not found, you shouldnt be seeing this 😅
    </h2>
  {:else if isNotStarted}
    <GameLobby user={_user} room={_room} {game} {players} {availableDecks} />
  {:else if isPreRound || isPostRound}
    <h2 class="text-4xl text-white font-bold text-center">Cargando...</h2>
  {:else if isFillSentence}
    <GameFillSentence {game} initTimerOnMount />
  {:else if isRateSentence}
    <GameRateSentence {game} {players} />
  {:else if isRoundWinner || isScoreboard || isEnded}
    <GameScoreboard {game} {players}>
      <svelte:fragment slot="actions">
        {#if isScoreboard || isEnded}
          <button
            class="btn variant-filled-primary variant-outline-primary"
            type="button"
            on:click={() => {
              setGameStatus(GAME_STATUS.NOT_STARTED);
            }}
          >
            Volver al lobby
          </button>
        {/if}
      </svelte:fragment>
    </GameScoreboard>
  {:else}
    <h2 class="text-4xl text-white font-bold text-center mb-[1em]">
      Unhandled game status: {gameStatus}, you shouldnt be seeing this 😅
    </h2>
  {/if}
</main>
