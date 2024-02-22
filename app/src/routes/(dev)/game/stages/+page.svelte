<script lang="ts">
  import { debugData } from '$comps/HyperDebug.svelte';
  import GameFillSentence from '$comps/game/GameFillSentence.svelte';
  import GameLobby from '$comps/game/GameLobby.svelte';
  import GameMessage from '$comps/game/GameMessage.svelte';
  import GameRateSentence from '$comps/game/GameRateSentence.svelte';
  import GameRoundWinner from '$comps/game/GameRoundWinner.svelte';
  import {
    game,
    gameActions,
    gameStatus,
    players,
    room,
    roomActions,
    roomStatus,
    self,
  } from '$lib/dev/state.js';
  import { decks } from '$lib/stores/decks.ts';
  import {
    GAME_STATUS,
    ROOM_STATUS_CLIENT,
    type GameStatus,
  } from '$shared/constants.js';
  import { GAME } from '$shared/defaults.js';
  import { onMount } from 'svelte';
  import { helpers } from 'svelte-hypercommands/CommandPalette.svelte';

  $: debugData.set({ $game, $players, $room, $self });

  function setGameStatus(status: GameStatus) {
    game.value.status = status;
    game.sync();
  }

  function emulateRateSentence() {
    game.value.status = GAME_STATUS.RATE_SENTENCE;

    for (let i = 0; i < $players.length; i++) {
      setTimeout(
        (id) => {
          game.value.current.ratingPlayer = id;
          game.sync();
        },
        i * GAME.DEFAULT_RATE_TIME,
        $players[i].id,
      );
    }
  }

  onMount(() => {
    // debugData.set(audioPlayer);
    // emulateRateSentence();
    setGameStatus(GAME_STATUS.FILL_SENTENCE);

    const cmdCleanup = helpers.registerCommand([
      {
        name: 'Toggle player role',
        description: "Toggle current player's role",
        onAction: () => {
          if (
            !self.value.loaded ||
            room.value.status === ROOM_STATUS_CLIENT.NO_LOADED
          ) {
            return;
          }
          self.value.player.id = self.value.player.id === '1' ? '3' : '1';
          self.sync();
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
      {
        category: 'GS',
        name: 'Round Winner',
        description: `Set game status to ${GAME_STATUS.ROUND_WINNER}`,
        onAction: () => {
          setGameStatus(GAME_STATUS.ROUND_WINNER);
        },
      },
      {
        category: 'GS',
        name: 'Scoreboard',
        description: `Set game status to ${GAME_STATUS.GAME_WINNER}`,
        onAction: () => {
          setGameStatus(GAME_STATUS.GAME_WINNER);
        },
      },
    ]);

    return () => {
      cmdCleanup();
    };
  });

  $: pageTitle =
    ($roomStatus.isGameActive ? 'Jugando' : 'Esperando') + ` - One More Chance`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<main
  class="h-full flex flex-col items-center justify-center overflow-y-auto p-1 ring-1 ring-cyan-500 md:ring-fuchsia-500 ring-inset"
>
  <h1 class="sr-only">A jugar One More Chance!</h1>
  {#if !$self.loaded || $roomStatus.isNotLoaded}
    <GameMessage>
      <svelte:fragment slot="title">
        Room not found, you shouldnt be seeing this 😅
      </svelte:fragment>
      <svelte:fragment slot="content">
        <a class="btn variant-filled-primary" href="/">Volver al inicio</a>
      </svelte:fragment>
    </GameMessage>
  {:else if $roomStatus.isNotFound || $roomStatus.isClosed}
    <GameMessage>
      <svelte:fragment slot="title">
        {#if $roomStatus.isNotFound}
          La sala no existe, puede que haya sido cerrada 😢
        {:else}
          La sala ha sido cerrada por el anfitrión 😢
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
      on:start_game={(e) => {
        roomActions.startGame();
      }}
      on:close_room={() => {
        roomActions.closeRoom();
      }}
      on:kick_player={(event) => {
        roomActions.kickPlayer(event.detail.userId);
      }}
      on:toggle_ready={(event) => {
        roomActions.setReady(event.detail);
      }}
      on:update_deck={(event) => {
        // TODO: update deck
        // roomActions.se(event.detail.deckId);
      }}
      on:update_settings={(event) => {
        // TODO: update settings
        // roomActions.updateSettings(event.detail);
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
</main>
