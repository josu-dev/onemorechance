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
    roomStatus,
    self,
    socketActions,
  } from '$game/game.js';
  import { audioPlayer } from '$lib/stores/audio.ts';
  import { decks } from '$lib/stores/decks.js';
  import { onFirstUserInteraction } from '$lib/utils/clientside.js';
  import { GAME_STATUS } from '$shared/constants.js';
  import { onMount } from 'svelte';

  $: if (dev) {
    debugData.set({
      $game,
      $players,
      $room,
      $self,
    });
  }

  $: pageTitle =
    ($roomStatus.isGameActive ? 'Jugando' : 'Esperando') + ` - One More Chance`;

  $: if ($roomStatus.isRoomLeft) {
    goto('/');
  }

  onMount(() => {
    const musicCleanup = onFirstUserInteraction(() => {
      audioPlayer.play('music_game.mp3', { loop: true });
    });

    return () => {
      socketActions.disconnect();
      musicCleanup();
      audioPlayer.stop('music_game.mp3');
    };
  });
</script>

<Seo
  title={pageTitle}
  description="Te vas a reir con y de tus amigos jugando unas partiditas de One More Chance"
  titleOG="Partida en curso - One More Chance"
/>

<main class="main">
  <h1 class="sr-only">A jugar One More Chance!</h1>
  <div class="my-[var(--header-height)] flex flex-1 flex-col items-center">
    {#if $roomStatus.isNotLoaded}
      <GameMessage>
        <svelte:fragment slot="title">
          Room not loaded, you shouldnt be seeing this 😅
        </svelte:fragment>
        <svelte:fragment slot="content">
          <a class="button variant-primary" href="/">Volver al inicio</a>
        </svelte:fragment>
      </GameMessage>
    {:else if $roomStatus.isNotFound || $roomStatus.isClosed}
      <GameMessage>
        <svelte:fragment slot="title">
          {#if $roomStatus.isNotFound}
            La sala no existe, puede que haya sido cerrada 😢
          {:else}
            La sala ha sido cerrada por el anfitrion 😢
          {/if}
        </svelte:fragment>
        <svelte:fragment slot="content">
          <a class="button variant-primary" href="/">Volver al inicio</a>
        </svelte:fragment>
      </GameMessage>
    {:else if $roomStatus.isConnecting}
      <GameMessage>
        <svelte:fragment slot="title">Conectando a la sala...</svelte:fragment>
        <svelte:fragment slot="content">
          <a class="button variant-primary" href="/">Volver al inicio</a>
        </svelte:fragment>
      </GameMessage>
    {:else if $gameStatus.isNotStarted || $gameStatus.isEnded}
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
        on:start_game={() => {
          roomActions.startGame();
        }}
      />
    {:else if $gameStatus.isPreRound || $gameStatus.isPostRound}
      <GameMessage>
        <svelte:fragment slot="title">Cargando...</svelte:fragment>
      </GameMessage>
    {:else if $gameStatus.isFillSentence}
      <GameFillSentence
        {game}
        on:freestyle={(event) => {
          gameActions.setFreestyle(event.detail);
        }}
        on:option={(event) => {
          gameActions.setSelectedOption(event.detail);
        }}
      />
    {:else if $gameStatus.isRateSentence}
      <GameRateSentence
        {game}
        {players}
        on:rate_sentence={(event) => {
          gameActions.ratePlayer(event.detail.playerId, event.detail.rate);
        }}
      />
    {:else if $gameStatus.isRoundWinner || $gameStatus.isGameWinner}
      <GameRoundWinner {game} {players}>
        <div
          slot="actions"
          class="flex justify-center"
          class:hidden={!$gameStatus.isGameWinner}
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
          Game status '{$gameStatus.value}' not implemented yet, sorry 😅
        </svelte:fragment>
      </GameMessage>
    {/if}
  </div>
</main>
