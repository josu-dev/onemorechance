<script lang="ts">
  import { dev } from '$app/environment';
  import { debugData } from '$lib/components/HyperDebug.svelte';
  import { GAME } from '$lib/configs';
  import {
    DECK_TYPE,
    GAME_STATUS,
    PLAYER_RATING,
    type GameStatus,
    type PlayerRating,
  } from '$lib/enums.js';
  import * as g from '$lib/stores/game.js';
  import { game, players } from '$lib/stores/game.js';
  import * as r from '$lib/stores/room.js';
  import { room } from '$lib/stores/room.js';
  import { user } from '$lib/stores/user.js';
  import type { Option, Player } from '$types';
  import { clipboard } from '@skeletonlabs/skeleton';

  export let data;

  if (dev) {
    debugData.set(room);
  }

  $: pageTitle = `${
    $room?.status === 'PLAYING' ? 'Jugando' : 'Sala de espera'
  } - One More Chance`;

  let rounds = GAME.DEFAULT_ROUNDS;
  let timer = GAME.DEFAULT_SELECTION_TIME / 1000;
  let numOptions = GAME.DEFAULT_OPTIONS;

  let gameStatus: GameStatus = GAME_STATUS.NOT_STARTED;
  let isNotStarted = true;
  let isPreRound = false;
  let isChoosingOption = false;
  let isRatingPlays = false;
  let isRoundWinner = false;
  let isOptionRefill = false;
  let isScoreboard = false;
  let isEnded = false;

  $: if ($game.status !== gameStatus) {
    gameStatus = $game.status;
    isNotStarted = gameStatus === GAME_STATUS.NOT_STARTED;
    isPreRound = gameStatus === GAME_STATUS.PRE_ROUND;
    isChoosingOption = gameStatus === GAME_STATUS.FILL_SENTENCE;
    isRatingPlays = gameStatus === GAME_STATUS.RATE_SENTENCE;
    isRoundWinner = gameStatus === GAME_STATUS.ROUND_WINNER;
    isOptionRefill = gameStatus === GAME_STATUS.POS_ROUND;
    isScoreboard = gameStatus === GAME_STATUS.SCOREBOARD;
    isEnded = gameStatus === GAME_STATUS.ENDED;
  }

  $: if (isChoosingOption) {
    startTimer('choose', ($game?.chooseTime ?? 0) / 1000);
  } else {
    endTimer('choose');
  }

  $: basePhrase = $game?.phrase.text ?? 'Missing frase';

  $: options = $game.players.find((p) => p.userId === $user?.id)?.options ?? [];

  let selectedOption: Partial<Option> = { text: undefined };
  let freestyleText: string | undefined = '';
  function fillFreestyle(text: string) {
    freestyleText = text;
    g.setFreestyle([text]);
  }

  $: filledPhrase = basePhrase + (freestyleText ?? selectedOption.text ?? '');

  function confirmPlayer(checked: boolean) {
    if (checked) {
      r.setReady();
    } else {
      r.setUnready();
    }
  }

  function startGame() {
    r.startGame();
  }

  const timerMap = new Map<string, ReturnType<typeof setInterval>>();
  function startTimer(key: string, initialTime: number) {
    if (timerMap.has(key)) {
      return;
    }

    timer = initialTime;

    timerMap.set(
      key,
      setInterval(() => {
        timer--;
        if (timer <= 0) {
          endTimer(key);
        }
      }, 1000),
    );
  }
  function endTimer(key: string) {
    const id = timerMap.get(key);
    if (!id) {
      return;
    }

    clearInterval(id);
    timerMap.delete(key);
  }

  function vote(vote: PlayerRating) {
    let audio;
    if (vote === PLAYER_RATING.BAD) {
      audio = new Audio('/audio/sfx_abucheo.mp3');
    } else if (vote === PLAYER_RATING.MEH) {
      audio = new Audio('/audio/sfx_meh.mp3');
    } else {
      audio = new Audio('/audio/sfx_aplauso.mp3');
    }
    audio.volume = 0.5;
    audio.play();
    g.ratePlayer($game?.ratingPlayer ?? '', vote);
  }

  let lastWinner: Player | undefined = undefined;
  $: if (isRoundWinner) {
    lastWinner = $players.find((p) => p.userId === $game?.lastWinner);
  }

  let playersByScore: Player[] = [];
  $: if (isScoreboard) {
    const temp: Player[] = [];
    for (const player of $players) {
      for (let i = 0; i < temp.length; i++) {
        if (temp[i].totalScore < player.totalScore) {
          temp.splice(i, 0, player);
          break;
        }
      }
    }
    playersByScore = temp;
  }

  function chooseOption(option: Option) {
    selectedOption = option;
  }

  let copyText = 'Copiar';
  function copyRoomCode() {
    copyText = 'Copiado! 👍';
    setTimeout(() => {
      copyText = 'Copiar';
    }, 2000);
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<main
  class="h-full flex flex-col items-center justify-center overflow-y-auto p-1"
>
  <h1 class="sr-only">A jugar One More Chance!</h1>
  {#if !$room || !$user}
    <h2 class="text-4xl text-white font-bold text-center">
      Room not found, you shouldnt be seeing this 😅
    </h2>
  {:else if data.isHost && isNotStarted}
    <h2 class="text-4xl text-white font-bold text-center mb-[1em]">
      Sala de espera
    </h2>

    <div
      class="previewer-preview flex justify-center items-center mx-auto transition-[width] duration-200 w-full"
    >
      <p class="text-3xl text-white mb-4 mr-4">
        ID - <span data-clipboard="roomId">{$room.id}</span>
        <button
          class="btn btn-sm variant-filled text-white bg-black rounded-lg ml-4"
          style="box-shadow: 0 0 0 2px white;"
          on:click={copyRoomCode}
          use:clipboard={$room.id}>{copyText}</button
        >
      </p>
    </div>

    <h3 class="text-3xl text-white mb-4">Jugadores</h3>
    <div class="flex flex-col items-left mb-4 space-y-4">
      {#each $players as player}
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 rounded-full bg-white"></div>
          <div class="text-lg text-white">{player.name}</div>
          {#if player.userId === $user.id}
            <input
              type="checkbox"
              on:change={(e) => {
                confirmPlayer(e.currentTarget.checked);
              }}
              class="form-checkbox text-black w-6 h-6"
            />
          {:else}
            <input
              type="checkbox"
              class="form-checkbox text-black w-6 h-6"
              checked={player.ready}
              disabled
            />
          {/if}
        </div>
      {/each}
    </div>

    <h3 class="text-2xl text-white mb-4">Configuración de la partida</h3>
    <form
      on:submit|preventDefault={startGame}
      class="flex flex-col items-center space-y-4 mb-8"
    >
      <table>
        <tr>
          <td style="text-align: left;padding-right: 20px;">
            <label for="rounds" class="text-lg text-white"
              >Cantidad de rondas:</label
            >
          </td>
          <td style="text-align: left;">
            <input
              type="number"
              id="rounds"
              bind:value={rounds}
              min="5"
              max="10"
              class="bg-black text-white p-2 rounded-lg"
            />
          </td>
        </tr>
        <tr>
          <td style="text-align: left;padding-right: 20px;">
            <label for="timer" class="text-lg text-white"
              >Timers (segundos):</label
            >
          </td>
          <td style="text-align: left;">
            <input
              type="number"
              id="timer"
              bind:value={timer}
              min="1"
              max="30"
              class="bg-black text-white p-2 rounded-lg"
            />
          </td>
        </tr>
        <tr>
          <!-- <td style="text-align: left; padding-right: 20px;">
            <label for="deck" class="text-lg text-white">Deck: </label>
          </td>
          <td style="text-align: left;padding-right: 20px;">
            <select id="deck" class="bg-black text-white p-2 rounded-lg">
              <option value="default">1</option>
            </select>
          </td> -->
        </tr>
        <tr>
          <td style="text-align: left;padding-right: 20px;">
            <label for="numOptions" class="text-lg text-white"
              >Cantidad de cartas:</label
            >
          </td>
          <td style="text-align: left;padding-right: 20px;">
            <input
              type="number"
              id="numOptions"
              bind:value={numOptions}
              min="4"
              max="8"
              class="bg-black text-white p-2 rounded-lg"
            />
          </td>
        </tr>
      </table>
      <button
        type="submit"
        class="btn text-white bg-black rounded-lg w-48 h-10 mt-4"
        style="box-shadow: 0 0 0 2px white;"
      >
        Iniciar Partida
      </button>
    </form>
  {:else if isNotStarted}
    <h2 class="text-4xl text-white font-bold text-center mb-[1em]">
      Sala de espera
    </h2>
    <div class="flex flex-col items-left mb-4 space-y-4">
      {#each $players as player}
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 rounded-full bg-white"></div>
          <div class="text-lg text-white">{player.name}</div>
          {#if player.userId === $user.id}
            <input
              type="checkbox"
              on:change={(e) => {
                confirmPlayer(e.currentTarget?.checked ?? false);
              }}
              class="form-checkbox text-black w-6 h-6"
            />
          {:else}
            <input
              type="checkbox"
              class="form-checkbox text-black w-6 h-6"
              checked={player.ready}
              disabled
            />
          {/if}
        </div>
      {/each}
    </div>
    <h3 class="text-2xl text-white mb-4">Configuración de la partida</h3>
    <form
      on:submit|preventDefault={startGame}
      class="flex flex-col items-center space-y-4 mb-8"
    >
      <table>
        <tr>
          <td style="text-align: left;padding-right: 20px;">
            <label for="rounds" class="text-lg text-white"
              >Cantidad de rondas:</label
            >
          </td>
          <td style="text-align: left;">
            <input
              type="number"
              id="rounds"
              bind:value={rounds}
              min="5"
              max="10"
              class="bg-black text-white p-2 rounded-lg"
              readonly
            />
          </td>
        </tr>
        <tr>
          <td style="text-align: left;padding-right: 20px;">
            <label for="timer" class="text-lg text-white"
              >Timers (segundos):</label
            >
          </td>
          <td style="text-align: left;">
            <input
              type="number"
              id="timer"
              bind:value={timer}
              min="1"
              max="30"
              class="bg-black text-white p-2 rounded-lg"
              readonly
            />
          </td>
        </tr>
        <tr>
          <td style="text-align: left; padding-right: 20px;">
            <label for="deck" class="text-lg text-white">Deck: </label>
          </td>
          <td style="text-align: left;padding-right: 20px;">
            <select
              id="deck"
              class="bg-black text-white p-2 rounded-lg"
              disabled
            >
              <option value="default">Default Deck</option>
            </select>
          </td>
        </tr>
        <tr>
          <td style="text-align: left;padding-right: 20px;">
            <label for="numOptions" class="text-lg text-white"
              >Cantidad de cartas:</label
            >
          </td>
          <td style="text-align: left;padding-right: 20px;">
            <input
              type="number"
              id="numOptions"
              bind:value={numOptions}
              min="4"
              max="8"
              class="bg-black text-white p-2 rounded-lg"
              readonly
            />
          </td>
        </tr>
      </table>
    </form>
  {:else if isPreRound || isOptionRefill}
    <h2 class="text-4xl text-white font-bold text-center">Cargando...</h2>
  {:else if isChoosingOption}
    <h2 class="text-4xl text-white font-bold text-center mb-[1em]">A jugar!</h2>
    <div
      class="flex items-center justify-center w-20 h-20 rounded-full bg-white mb-4"
    >
      <p class="text-center text-black text-3xl">{timer}</p>
    </div>
    <div class="flex justify-center items-center w-128">
      <div
        class="card bg-black border-white border-2 p-4 rounded-lg"
        style="width: 300px; height: 400px;"
      >
        <p class="text-white text-center text-2xl mt-6">
          {`“${filledPhrase}“`}
        </p>
      </div>
    </div>
    <div class="flex flex-col items-center mt-4 h-32">
      {#if $game.deck.type === DECK_TYPE.CHOOSE}
        {#each options as option (option.id)}
          <button
            class="bg-black text-white p-2 rounded-lg mb-2"
            on:click={() => chooseOption(option)}
            style="cursor: pointer;"
          >
            {option.text}
          </button>
        {/each}
      {:else}
        <label for="freestyleCompletition" class="sr-only">Completar con</label>
        <input
          type="text"
          id="freestyleCompletition"
          class="!bg-black text-white p-2 rounded-lg mb-2 variant-outline-primary"
          on:input={(e) => {
            fillFreestyle(e.currentTarget.value);
          }}
        />
      {/if}
    </div>
  {:else if isRatingPlays}
    <div class="flex flex-col">
      <h2 class="text-4xl text-white font-bold text-center mb-[1em]">
        A puntuar!
      </h2>
      {#each $players as player (player.userId)}
        {#if player.userId === $game.ratingPlayer}
          <div class="flex justify-center items-center w-128">
            <div
              class="card bg-black border-white border-2 p-4 rounded-lg"
              style="width: 300px; height: 400px;"
            >
              <p class="text-white text-center text-2xl mt-6">
                “{basePhrase}
                {player.freestyle}“
              </p>
            </div>
          </div>
          <div class="flex justify-center mt-4">
            <button
              class="mx-2 p-4 text-3xl"
              on:click={() => vote(PLAYER_RATING.GOD)}>👍</button
            >
            <button
              class="mx-2 p-4 text-3xl"
              on:click={() => vote(PLAYER_RATING.MEH)}>😐</button
            >
            <button
              class="mx-2 p-4 text-3xl"
              on:click={() => vote(PLAYER_RATING.BAD)}>👎</button
            >
          </div>
        {/if}
      {/each}
    </div>
  {:else if isRoundWinner}
    <h2 class="text-4xl text-white font-bold text-center mb-[1em]">
      Ganador de la ronda!
    </h2>
    <p class="text-white font-semibold text-2xl">
      El ganar de la ronda es {lastWinner?.name} con
    </p>
    <div class="flex justify-center items-center w-128">
      <div
        class="card bg-black border-white border-2 p-4 rounded-lg"
        style="width: 300px; height: 400px;"
      >
        <p class="text-white text-center text-2xl mt-6">
          “{basePhrase}
          {lastWinner?.freestyle}“
        </p>
      </div>
    </div>
  {:else if isScoreboard || isEnded}
    <h2 class="text-4xl text-white font-bold text-center mb-[1em]">
      Tabla de puntajes Final
    </h2>
    {#each playersByScore as player}
      <div class="flex items-center space-x-4">
        <div class="w-10 h-10 rounded-full bg-white"></div>
        <div class="text-lg text-white">{player.name}</div>
        <div class="text-lg text-white">{player.totalScore}</div>
      </div>
    {/each}
  {:else}
    <h2 class="text-4xl text-white font-bold text-center mb-[1em]">
      Esperando... {dev ? gameStatus : ''}
    </h2>
  {/if}
</main>
