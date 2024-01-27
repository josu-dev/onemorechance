<script lang="ts">
  import HostMenu from "$cmp/room/HostMenu.svelte";
  import PlayerMenu from "$cmp/room/PlayerMenu.svelte";
  import { room, roomUsers } from "$lib/stores/room.js";
  import { user } from "$lib/stores/user.js";
  import SuperDebug from "sveltekit-superforms/client/SuperDebug.svelte";

  export let data;
  let rounds = 5;
  let timer = 15;
  let selectedDeck = "default";
  let numOptions = 4;
  let confirmed = false;
  function startGame() {
    // Guardar las configuraciones en el store o enviar al servidor
    // data.setConfig({
    //   rounds,
    //   timer,
    //   selectedDeck,
    //   numOptions,
    // });
    // Iniciar el juego
    // ...
  }
</script>

<div
  class="text-white bg-black min-h-screen flex flex-col items-center justify-center"
>
  {#if !$room || !$user}
    <HostMenu />
    <h1 class="mt-4 text-lg text-white">Room not found</h1>
  {:else if data.isHost}
    <h1 class="text-3xl text-white mb-4">Jugadores</h1>
    <div class="flex flex-col items-left mb-4 space-y-4">
      {#each $roomUsers as player}
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 rounded-full bg-white"></div>
          <div class="text-lg text-white">{player.name}</div>
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
            <label for="deck" class="text-lg text-white"
              >Seleccionar deck a utilizar:</label
            >
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
              >Cantidad de cartas u opciones:</label
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
  {:else}
    <h1 class="text-3xl text-white mb-4">Jugadores</h1>
    <div class="flex flex-col items-left mb-4 space-y-4">
      {#each $roomUsers as player}
        <div class="flex items-center space-x-4">
          <div class="w-10 h-10 rounded-full bg-white"></div>
          <div class="text-lg text-white">{player.name}</div>
          <input
            type="checkbox"
            bind:checked={confirmed}
            class="form-checkbox text-white"
          />
        </div>
      {/each}
    </div>
    <PlayerMenu />
  {/if}
</div>

<SuperDebug data={{ room: $room, players: $roomUsers }} />
