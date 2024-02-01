<script lang="ts">
  import { dev } from '$app/environment';
  import { debugData } from '$comps/HyperDebug.svelte';
  import GameFillSentence from '$comps/game/GameFillSentence.svelte';
  import GameLobby from '$comps/game/GameLobby.svelte';
  import GameRateSentence from '$comps/game/GameRateSentence.svelte';
  import GameScoreboard from '$comps/game/GameScoreboard.svelte';
  import GameUnimplemented from '$comps/game/GameUnimplemented.svelte';
  import {
    GAME_STATUS,
  } from '$lib/enums.js';
  import type { GameStatus } from '$lib/enums.js';
  import * as g from '$lib/stores/game.js';
  import { game, players } from '$lib/stores/game.js';
  import * as r from '$lib/stores/room.js';
  import { room } from '$lib/stores/room.js';
  import { user } from '$lib/stores/user.js';
  import { availableDecks } from '$lib/stores/config.js';

  // export let data;

  if (dev) {
    debugData.set(room);
  }

  $: pageTitle = `${
    $room?.status === 'PLAYING' ? 'Jugando' : 'Esperando'
  } - One More Chance`;

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
              // TODO
            }}
          >
            Volver al lobby
          </button>
        {/if}
      </svelte:fragment>
    </GameScoreboard>
  {:else}
    <GameUnimplemented {gameStatus} />
  {/if}
</main>
