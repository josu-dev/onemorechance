<script lang="ts">
  import HostMenu from "$cmp/room/HostMenu.svelte";
  import PlayerMenu from "$cmp/room/PlayerMenu.svelte";
  import { room, roomUsers } from "$lib/stores/room.js";
  import { user } from "$lib/stores/user.js";
  import { debugData } from "$lib/components/HyperDebug.svelte";
  import { GAME } from "$lib/defaults";
  import { GAME_STATUS } from "$lib/enums.js";
  import * as r from "$lib/stores/room.js";

  export let data;
  let rounds = GAME.ROUNDS;
  let timer = GAME.COMPLETE_ROUND_TIME;
  let numOptions = GAME.OPTIONS;
  let selectedDeck = "default";

  $: gameStatus = $room?.game.status;
  $: game = $room?.game;

  let incompletePhrase =
    "El doctor me dijo que mi enfermedad no tiene cura culpa de ";
  let wordList = [
    "Me coji al chavo",
    "Pelar pijas con la cola",
    "Lluvia de pijas",
    "Vieja",
    "Una paja en el micro",
    "Puto",
    "Otaku",
    "Peronista",
    "Banana",
  ];

  let selectedWord = "_______";
  function confirmPlayer(checked: boolean) {
    if (checked) {
      r.setReady();
    } else {
      r.setUnready();
    }
  }

  function startGame() {
    gameStatus = "IN_PROGRESS";
    const countdown = () => {
      if (timer > 0) {
        timer -= 1;
      } else {
        gameStatus = "SELECTION_END";
        clearInterval(interval);
      }
    };

    const interval = setInterval(countdown, 1000);
  }

  function selectWord(word: string) {
    selectedWord = word;
  }

  function vote(voteType: string) {
    gameStatus = "ROUND_ENDED";
    //TODO Handle user vote
  }

  debugData.set(room);
</script>


<div
  class="text-white bg-black min-h-screen flex flex-col items-center justify-center"
>
  {#if !$room || !$user}
    <HostMenu />
    <h1 class="mt-4 text-lg text-white">Room not found</h1>
  {:else if data.isHost && gameStatus === GAME_STATUS.WAITING_TO_START}
    <!-- Host lobby waiting -->
    <h1 class="text-3xl text-white mb-4">Jugadores</h1>
    <h2 class="text-3xl text-white mb-4">Id de la sala : {$room?.id}</h2>
    <div class="flex flex-col items-left mb-4 space-y-4">
      {#each $roomUsers as player}
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 rounded-full bg-white"></div>
          <div class="text-lg text-white">{player.name}</div>
          {#if player.id == $user.id}
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
              value = {false}
              disabled
            />
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
              min="15"
              max="30"
              class="bg-black text-white p-2 rounded-lg"
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
              bind:value={selectedDeck}
              class="bg-black text-white p-2 rounded-lg"
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
  {:else if gameStatus === GAME_STATUS.WAITING_TO_START}
    <!-- Guest lobby waiting -->
    <h1 class="text-3xl text-white mb-4">Jugadores</h1>
    <div class="flex flex-col items-left mb-4 space-y-4">
      {#each $roomUsers as player}
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 rounded-full bg-white"></div>
          <div class="text-lg text-white">{player.name}</div>
          {#if player.id == $user.id}
            <input
              type="checkbox"
              on:change={(e) => {
                confirmPlayer(e.currentTarget?.checked ?? false);
              }}
              class="form-checkbox text-black w-6 h-6"
            />
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
              min="15"
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
              bind:value={selectedDeck}
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

    <PlayerMenu />
  {:else if gameStatus === GAME_STATUS.IN_PROGRESS}
    <!-- On Game -->
    <h1 class="text-3xl text-white mb-4">Partida</h1>
    <div class="flex justify-center items-center w-128">
      <div
        class="card bg-black border-white border-2 p-4 rounded-lg"
        style="width: 50%; aspect-ratio: 2 / 3;"
      >
        <p class="text-white text-xxl">
          “{incompletePhrase}
          {selectedWord}“
        </p>
      </div>
    </div>
    <div class="flex flex-col items-center mt-4 overflow-auto h-32">
      {#each wordList as word (word)}
        <button
          class="bg-black text-white p-2 rounded-lg mb-2"
          on:click={() => selectWord(word)}
          style="cursor: pointer;"
        >
          {word}
        </button>
      {/each}
    </div>
    <p class="m-4">Tiempo restante: {timer} segundos</p>
  {:else if gameStatus === GAME_STATUS.SELECTION_END}
    <!-- Voting -->
    <h1 class="text-3xl text-white mb-4">Puntuar</h1>
    <div class="flex justify-center items-center w-128">
      <div
        class="card bg-black border-white border-2 p-4 rounded-lg"
        style="width: 50%; aspect-ratio: 2 / 3;"
      >
        <p class="text-white text-xxl">
          “El doctor me dijo que mi enfermedad no tiene cura culpa de {selectedWord}“
        </p>
      </div>
    </div>
    <div class="flex justify-center mt-4">
      <button class="mx-2 p-4 text-3xl" on:click={() => vote("like")}>👍</button
      >
      <button class="mx-2 p-4 text-3xl" on:click={() => vote("meh")}>😐</button>
      <button class="mx-2 p-4 text-3xl" on:click={() => vote("dislike")}
        >👎</button
      >
    </div>
  {:else if gameStatus === GAME_STATUS.ROUND_ENDED}
    <!-- Leaderboard -->
    <h1 class="text-3xl text-white mb-4">Tabla de puntajes</h1>
    {#each $roomUsers as player}
      <div class="flex items-center space-x-4">
        <div class="w-10 h-10 rounded-full bg-white"></div>
        <div class="text-lg text-white">{player.name}</div>
        <!-- <div class="text-lg text-white">{player.score}</div> -->
      </div>
    {/each}
  {/if}
</div>
