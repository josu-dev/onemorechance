<script lang="ts">
  import { dev } from "$app/environment";
  import { debugData } from "$lib/components/HyperDebug.svelte";
  import { GAME } from "$lib/defaults";
  import {
    DECK_TYPE,
    GAME_STATUS,
    PLAYER_RATING,
    type GameStatus,
    type PlayerRating,
  } from "$lib/enums.js";
  import * as g from "$lib/stores/game.js";
  import { game, players } from "$lib/stores/game.js";
  import * as r from "$lib/stores/room.js";
  import { room } from "$lib/stores/room.js";
  import { user } from "$lib/stores/user.js";
  import type { Option } from "$types";
  import { clipboard } from "@skeletonlabs/skeleton";

  export let data;

  if (dev) {
    debugData.set(room);
  }

  let rounds = GAME.ROUNDS;
  let timer = GAME.ROUND_CHOOSE_TIME / 1000;
  let numOptions = GAME.OPTIONS;

  let gameStatus: GameStatus = GAME_STATUS.NOT_STARTED;
  let isNotStarted = true;
  let isPreRound = false;
  let isChoosingOption = false;
  let isRatingPlays = false;
  let isRoundWinner = false;
  let isOptionRefill = false;
  let isScoreboard = false;
  let voted = false;
  $: if ($game.status !== gameStatus) {
    gameStatus = $game.status;
    isNotStarted = gameStatus === GAME_STATUS.NOT_STARTED;
    isChoosingOption = gameStatus === GAME_STATUS.CHOOSING_OPTION;
    isRatingPlays = gameStatus === GAME_STATUS.RATING_PLAYS;
    isScoreboard = gameStatus === GAME_STATUS.SCOREBOARD;
    isOptionRefill = gameStatus === GAME_STATUS.OPTION_REFILL;
    isPreRound = gameStatus === GAME_STATUS.PRE_ROUND;
    isRoundWinner = gameStatus === GAME_STATUS.ROUND_WINNER;
  }

  $: if (isChoosingOption) {
    startTimer("choose", ($game?.chooseTime ?? 0) / 1000);
  } else {
    endTimer("choose");
  }

  $: basePhrase = $game?.phrase.text ?? "Missing frase";

  $: options = $game.players.find((p) => p.userId === $user?.id)?.options ?? [];

  let selectedOption = { text: undefined };
  let freestyleText: string | undefined = "";
  function fillFreestyle(text: string) {
    freestyleText = text;
    g.setFreestyle([text]);
  }

  $: filledPhrase = basePhrase + (freestyleText ?? selectedOption.text ?? "");

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
      }, 1000)
    );
  }
  function endTimer(key: string) {
    clearInterval(timerMap.get(key));
  }

  function vote(vote: PlayerRating) {
    if (!voted) {
      voted = true;
      let audio ;
      if (vote === PLAYER_RATING.BAD) {
        audio = new Audio("/audio/sfx_abucheo.mp3");
      } else if (vote === PLAYER_RATING.MEH) {
        audio = new Audio("/audio/sfx_meh.mp3");
      }else {
        audio = new Audio("/audio/sfx_aplauso.mp3");
      }
      audio.volume = 0.5;
      audio.play();
      g.ratePlayer($game?.ratingPlayer ?? "", vote);
    }
  }

  function chooseOption(option: Option) {
    selectedOption = option;
  }

  let buttonText = "Copiar";
  function copy() {
    buttonText = "Copiado! 👍";
    setTimeout(() => {
      buttonText = "Copiar";
    }, 2000);
  }
</script>

<div
  class="text-white bg-black min-h-screen flex flex-col items-center justify-center"
>
  {#if !$room || !$user}
    <h1 class="mt-4 text-lg text-white">
      Room not found, you shouldnt be seeing this 😅
    </h1>
  {:else if data.isHost && isNotStarted}
    <h1 class="text-3xl text-white mb-4">Jugadores</h1>

    <div
      class="previewer-preview flex justify-center items-center mx-auto transition-[width] duration-200 w-full"
    >
      <h2 class="text-3xl text-white mb-4 mr-4">Id de la sala:</h2>
      <h2 class="text-3xl text-white mb-4" data-clipboard="roomId">
        {$room.id}
      </h2>
      <button
        class="btn variant-filled text-white bg-black rounded-lg ml-4"
        style="box-shadow: 0 0 0 2px white;"
        on:click={copy}
        use:clipboard={$room.id}>{buttonText}</button
      >
    </div>

    <h1 class="text-3xl text-white mb-4">Jugadores</h1>
    <div class="flex flex-col items-left mb-4 space-y-4">
      {#each $players as player}
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 rounded-full bg-white"></div>
          <div class="text-lg text-white">{player.name}</div>
          {#if player.userId == $user.id}
            <input
              type="checkbox"
              on:change={(e) => {
                confirmPlayer(e.currentTarget?.checked ?? false);
              }}
              class="form-checkbox text-black w-6 h-6"
            />
          {:else if player.ready}
            <input
              type="checkbox"
              class="form-checkbox text-black w-6 h-6"
              checked={player.ready}
              disabled
            />
          {:else}
            <span class="text-white text-xl">X</span>
          {/if}
        </div>
      {/each}
    </div>

    <h1 class="text-3xl text-white mb-4">Configuración de la partida</h1>
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
  {:else if (data.isHost && isPreRound) || isOptionRefill}
    <!-- Host lobby waiting -->
    <h1 class="text-3xl text-white mb-4">Esperando....</h1>
  {:else if isNotStarted}
    <!-- Guest lobby waiting -->
    <h1 class="text-3xl text-white mb-4">Jugadores</h1>
    <div class="flex flex-col items-left mb-4 space-y-4">
      {#each $players as player}
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 rounded-full bg-white"></div>
          <div class="text-lg text-white">{player.name}</div>
          {#if player.userId == $user.id}
            <input
              type="checkbox"
              on:change={(e) => {
                confirmPlayer(e.currentTarget?.checked ?? false);
              }}
              class="form-checkbox text-black w-6 h-6"
            />
          {:else if player.ready}
            <input
              type="checkbox"
              class="form-checkbox text-black w-6 h-6"
              checked={player.ready}
              disabled
            />
          {:else}
            <span class="text-white text-xl">X</span>
          {/if}
        </div>
      {/each}
    </div>
    <h1 class="text-3xl text-white mb-4">Configuración de la partida</h1>
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
  {:else if isChoosingOption}
    <h1 class="text-3xl text-white mb-4">Partida</h1>
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
    <h1 class="text-3xl text-white mb-4">Puntuar</h1>
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
    {#if !voted}
      <div class="flex justify-center mt-4">
        <button
          class="mx-2 p-4 text-3xl"
          on:click={() => vote(PLAYER_RATING.GOOD)}>👍</button
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
  {:else if isScoreboard}
    <h1 class="text-3xl text-white mb-4">Tabla de puntajes</h1>
    {#each $players as player}
      <div class="flex items-center space-x-4">
        <div class="w-10 h-10 rounded-full bg-white"></div>
        <div class="text-lg text-white">{player.name}</div>
        <div class="text-lg text-white">{player.totalScore}</div>
      </div>
    {/each}
  {:else}
    <h1 class="text-3xl text-white mb-4">Esperando... {gameStatus}</h1>
  {/if}
</div>
