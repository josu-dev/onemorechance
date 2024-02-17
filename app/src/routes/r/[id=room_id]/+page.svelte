<script lang="ts">
  import { dev } from '$app/environment';
  import { goto } from '$app/navigation';
  import { debugData } from '$comps/HyperDebug.svelte';
  import GameFillSentence from '$comps/game/GameFillSentence.svelte';
  import GameLobby from '$comps/game/GameLobby.svelte';
  import GameMessage from '$comps/game/GameMessage.svelte';
  import GameRateSentence from '$comps/game/GameRateSentence.svelte';
  import GameRoundWinner from '$comps/game/GameRoundWinner.svelte';
  import Seo from '$comps/layout/Seo.svelte';
  import {
    game,
    gameActions,
    gameStatus,
    players,
    room,
    roomActions,
    self,
    socketActions,
  } from '$game/game.js';
  import { decks } from '$lib/stores/decks.js';
  import { GAME_STATUS, ROOM_STATUS_CLIENT } from '$shared/constants.js';
  import { onMount } from 'svelte';

  $: if (dev) {
    debugData.set({
      $game,
      $players,
      $room,
      $self,
    });
  }

  $: pageTitle = `${
    $room.status === ROOM_STATUS_CLIENT.GAME_ON ? 'Jugando' : 'Esperando'
  } - One More Chance`;

  $: isNotStarted = $gameStatus === GAME_STATUS.NOT_STARTED;
  $: isPreRound = $gameStatus === GAME_STATUS.PRE_ROUND;
  $: isFillSentence = $gameStatus === GAME_STATUS.FILL_SENTENCE;
  $: isRateSentence = $gameStatus === GAME_STATUS.RATE_SENTENCE;
  $: isRoundWinner = $gameStatus === GAME_STATUS.ROUND_WINNER;
  $: isPostRound = $gameStatus === GAME_STATUS.POST_ROUND;
  $: isScoreboard = $gameStatus === GAME_STATUS.END_SCOREBOARD;
  $: isEnded = $gameStatus === GAME_STATUS.ENDED;

  $: if ($room.status === ROOM_STATUS_CLIENT.LEFT) {
    goto('/');
  }

  onMount(() => {
    return () => {
      socketActions.disconnect();
    };
  });
</script>

<Seo
  title={pageTitle}
  description="Te vas a reir con y de tus amigos jugando unas partiditas de One More Chance"
  titleOg="Partida en curso - One More Chance"
/>

<main class="main justify-center py-1">
  <h1 class="sr-only">A jugar One More Chance!</h1>
  {#if !$self.loaded || $room.status === ROOM_STATUS_CLIENT.NO_ROOM}
    <GameMessage>
      <svelte:fragment slot="title">
        Room not loaded, you shouldnt be seeing this 😅
      </svelte:fragment>
      <svelte:fragment slot="content">
        <a class="button variant-primary" href="/">Volver al inicio</a>
      </svelte:fragment>
    </GameMessage>
  {:else if $room.status === ROOM_STATUS_CLIENT.CLOSED}
    <GameMessage>
      <svelte:fragment slot="title">
        La sala ha sido cerrada por el anfitrión 😢
      </svelte:fragment>
      <svelte:fragment slot="content">
        <a class="button variant-primary" href="/">Volver al inicio</a>
      </svelte:fragment>
    </GameMessage>
  {:else if $room.status === ROOM_STATUS_CLIENT.CONNECTING}
    <GameMessage>
      <svelte:fragment slot="title">Conectando a la sala...</svelte:fragment>
      <svelte:fragment slot="content">
        <a class="button variant-primary" href="/">Volver al inicio</a>
      </svelte:fragment>
    </GameMessage>
  {:else if isNotStarted || isEnded}
    <GameLobby
      {self}
      {room}
      {game}
      {players}
      {decks}
      on:kick_player={(event) => {
        roomActions.kickPlayer(event.detail.userId);
      }}
      on:toggle_ready={(event) => {
        roomActions.setReady(event.detail);
      }}
      on:update_deck={(event) => {
        gameActions.setSettings(event.detail);
      }}
      on:update_settings={(event) => {
        gameActions.setSettings(event.detail);
      }}
      on:close_room={() => {
        roomActions.closeRoom();
      }}
      on:leave_room={() => {
        roomActions.leaveRoom();
      }}
      on:start_game={(e) => {
        roomActions.startGame(e.detail);
      }}
    />
  {:else if isPreRound || isPostRound}
    <GameMessage>
      <svelte:fragment slot="title">Cargando...</svelte:fragment>
    </GameMessage>
  {:else if isFillSentence}
    <GameFillSentence
      {game}
      on:freestyle={(event) => {
        gameActions.setFreestyle(event.detail);
      }}
      on:option={(event) => {
        gameActions.setSelectedOption(event.detail);
      }}
    />
  {:else if isRateSentence}
    <GameRateSentence
      {game}
      {players}
      on:rate_sentence={(event) => {
        gameActions.ratePlayer(event.detail.playerId, event.detail.rate);
      }}
    />
  {:else if isRoundWinner || isScoreboard}
    <GameRoundWinner {game} {players}>
      <div
        slot="actions"
        class="flex justify-center"
        class:hidden={!isScoreboard}
      >
        <button
          on:click={() => {
            game.value.status = GAME_STATUS.ENDED;
            game.sync();
          }}
          class="button variant-primary"
        >
          Volver al lobby
        </button>
      </div>
    </GameRoundWinner>
  {:else}
    <GameMessage>
      <svelte:fragment slot="title">
        Game status '{$gameStatus}' not implemented yet, sorry 😅
      </svelte:fragment>
    </GameMessage>
  {/if}
</main>
