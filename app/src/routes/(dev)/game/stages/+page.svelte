<script lang="ts">
  import { debugData } from '$comps/HyperDebug.svelte';
  import GameFillSentence from '$comps/game/GameFillSentence.svelte';
  import GameLobby from '$comps/game/GameLobby.svelte';
  import GameMessage from '$comps/game/GameMessage.svelte';
  import GameRateSentence from '$comps/game/GameRateSentence.svelte';
  import GameScoreboard from '$comps/game/GameScoreboard.svelte';
  import { GAME } from '$game/configs.js';
  import type { GameStatus } from '$game/enums.js';
  import { GAME_STATUS, ROOM_STATUS } from '$game/enums.js';
  import {
    decks,
    game,
    gameActions,
    gameStatus,
    players,
    room,
    roomActions,
    self,
  } from '$lib/dev/state';
  import { audioPlayer } from '$lib/stores/audio.js';
  import { onMount } from 'svelte';
  import { helpers } from 'svelte-hypercommands/CommandPalette.svelte';

  // export let data;

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
    debugData.set(room);
    // debugData.set(audioPlayer);
    // emulateRateSentence();
    // setGameStatus(GAME_STATUS.RATE_SENTENCE);

    const cmdCleanup = helpers.registerCommand([
      {
        name: 'Toggle player role',
        description: "Toggle current player's role",
        onAction: () => {
          if (
            !self.value.registered ||
            room.value.status === ROOM_STATUS.NO_ROOM
          ) {
            return;
          }
          self.value.id = self.value.id === '1' ? '3' : '1';
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
    ]);

    return () => {
      cmdCleanup();
    };
  });

  $: pageTitle = `${
    $room.status === ROOM_STATUS.IN_GAME ? 'Jugando' : 'Esperando'
  } - One More Chance`;

  $: isNotStarted = $gameStatus === GAME_STATUS.NOT_STARTED;
  $: isPreRound = $gameStatus === GAME_STATUS.PRE_ROUND;
  $: isFillSentence = $gameStatus === GAME_STATUS.FILL_SENTENCE;
  $: isRateSentence = $gameStatus === GAME_STATUS.RATE_SENTENCE;
  $: isRoundWinner = $gameStatus === GAME_STATUS.ROUND_WINNER;
  $: isPostRound = $gameStatus === GAME_STATUS.POST_ROUND;
  $: isScoreboard = $gameStatus === GAME_STATUS.END_SCOREBOARD;
  $: isEnded = $gameStatus === GAME_STATUS.ENDED;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<main
  class="h-full flex flex-col items-center justify-center overflow-y-auto p-1 ring-1 ring-cyan-500 md:ring-fuchsia-500 ring-inset"
>
  <h1 class="sr-only">A jugar One More Chance!</h1>
  {#if !$self.registered || $room.status === ROOM_STATUS.NO_ROOM}
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
      {self}
      {room}
      {game}
      {players}
      {decks}
      on:start_game={() => {
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
  {:else if isPreRound || isPostRound}
    <GameMessage>
      <svelte:fragment slot="title">Cargando...</svelte:fragment>
    </GameMessage>
  {:else if isFillSentence}
    <GameFillSentence
      {game}
      initTimerOnMount
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
    <GameScoreboard {game} {players}>
      <svelte:fragment slot="actions">
        {#if isScoreboard}
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
    <GameMessage>
      <svelte:fragment slot="title">
        Game status '{$gameStatus}' not implemented yet, sorry 😅
      </svelte:fragment>
    </GameMessage>
  {/if}
</main>
