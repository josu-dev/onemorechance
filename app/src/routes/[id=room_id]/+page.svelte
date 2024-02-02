<script lang="ts">
  import { dev } from '$app/environment';
  import { debugData } from '$comps/HyperDebug.svelte';
  import GameFillSentence from '$comps/game/GameFillSentence.svelte';
  import GameLobby from '$comps/game/GameLobby.svelte';
  import GameMessage from '$comps/game/GameMessage.svelte';
  import GameRateSentence from '$comps/game/GameRateSentence.svelte';
  import GameScoreboard from '$comps/game/GameScoreboard.svelte';
  import type { GameStatus } from '$lib/enums.js';
  import { GAME_STATUS } from '$lib/enums.js';
  import { availableDecks } from '$lib/stores/config.js';
  import * as g from '$lib/stores/game.js';
  import { game, players } from '$lib/stores/game.js';
  import * as r from '$lib/stores/room.js';
  import { room } from '$lib/stores/room.js';
  import { user } from '$lib/stores/user.js';

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
    <GameMessage>
      <svelte:fragment slot="title">
        Room not found, you shouldnt be seeing this 😅
      </svelte:fragment>
      <svelte:fragment slot="content">
        <a class="btn variant-filled-primary" href="/">Volver al inicio</a>
      </svelte:fragment>
    </GameMessage>
  {:else if isNotStarted || isEnded}
    <GameLobby
      user={_user}
      room={_room}
      {game}
      {players}
      {availableDecks}
      on:start_game={() => {
        r.startGame();
      }}
      on:close_room={() => {
        r.closeRoom();
      }}
      on:kick_player={(event) => {
        r.kickPlayer(event.detail.userId);
      }}
      on:toggle_ready={(event) => {
        r.setReady(event.detail);
      }}
      on:update_deck={(event) => {
        r.setGameDeck(event.detail.deckId);
      }}
      on:update_settings={(event) => {
        // TODO: update settings
        // r.updateSettings(event.detail);
      }}
    />
  {:else if isPreRound || isPostRound}
    <GameMessage>
      <svelte:fragment slot="title">Cargando...</svelte:fragment>
    </GameMessage>
  {:else if isFillSentence}
    <GameFillSentence
      {game}
      initTimerOnMount
      on:freestyle={(event) => {
        g.setFreestyle(event.detail);
      }}
      on:option={(event) => {
        g.setSelectedOption(event.detail[0] ?? 'Unknown');
      }}
    />
  {:else if isRateSentence}
    <GameRateSentence
      {game}
      {players}
      on:rate_sentence={(event) => {
        g.ratePlayer(event.detail.playerId, event.detail.rate);
      }}
    />
  {:else if isRoundWinner || isScoreboard}
    <GameScoreboard {game} {players}>
      <svelte:fragment slot="actions">
        {#if isScoreboard}
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
    <GameMessage>
      <svelte:fragment slot="title">
        Game status '{gameStatus}' not implemented yet, sorry 😅
      </svelte:fragment>
    </GameMessage>
  {/if}
</main>
