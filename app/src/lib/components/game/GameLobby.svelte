<script lang="ts">
  import CopyButton from '$comps/shared/CopyButton.svelte';
  import { GAME } from '$lib/configs';
  import { DECK_TYPE, PLAYER_ROLE } from '$lib/enums.js';
  import type { ExposedWritable, Readable } from '$lib/stores/types';
  import type { DeckIdentifier, Game, Player, Room, User } from '$types';
  import { createEventDispatcher } from 'svelte';

  export let user: ExposedWritable<User>;
  export let room: ExposedWritable<Room>;
  export let game: ExposedWritable<Game>;
  export let players: Readable<Player[]>;
  export let availableDecks: Readable<DeckIdentifier[]>;

  $: isHost = $user?.id === $room?.host.id;
  $: isInvited = !isHost;

  let selectedSettings = {
    rounds: GAME.DEFAULT_ROUNDS,
    selectionTime: GAME.DEFAULT_SELECTION_TIME,
    options: GAME.DEFAULT_OPTIONS,
    deckId: '',
  };

  let selectedDeck: DeckIdentifier = {
    id: '',
    name: '',
    type: 'CHOOSE',
    description: '',
  };

  const dispatch = createEventDispatcher<{
    toggle_ready: boolean;
    start_game: boolean;
    close_room: boolean;
    kick_player: { userId: string };
    update_deck: { deckId: string };
    update_settings: {
      rounds: number;
      selectionTime: number;
      options: number;
      deckId: string;
    };
  }>();

  function dispatchStartGame() {
    dispatch('start_game', true);
  }
  function dispatchToggleReady(event: boolean) {
    dispatch('toggle_ready', event);
  }
  function dispatchCloseRoom() {
    dispatch('close_room', true);
  }
  function dispatchKickPlayer(event: { userId: string }) {
    dispatch('kick_player', event);
  }
  function dispatchUpdateSettings(
    event: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement },
  ) {
    event.preventDefault();
    dispatch('update_settings', selectedSettings);
  }

  function selectDeck(event: { deckId: string }) {
    const newDeck = $availableDecks.find((deck) => deck.id === event.deckId);
    if (!newDeck) {
      console.error('Deck not found');
      return;
    }
    selectedSettings.deckId = newDeck.id;
    selectedDeck.id = newDeck.id;
    selectedDeck.name = newDeck.name;
    selectedDeck.type = newDeck.type;
    selectedDeck.description = newDeck.description;
  }

  function askForCloseRoom() {
    if (confirm('¿Estás seguro de cerrar la sala?')) {
      dispatchCloseRoom();
    }
  }

  function askForKickPlayer(player: Player) {
    if (confirm(`¿Estás seguro de expulsar a ${player.name}?`)) {
      dispatchKickPlayer({ userId: player.userId });
    }
  }

  function triggerStartGame() {
    // check for readys
    triggerStartGame();
  }
</script>

<section
  class="flex flex-1 flex-col justify-center items-center text-fuchsia-200"
>
  <header class="flex flex-col text-center mb-4 md:mb-12">
    <h2 class="text-4xl text-white font-bold mb-1 md:mb-3">Sala de espera</h2>
    <p class="flex justify-center gap-2 text-xl leading-none text-primary-100">
      {$room.id}
      <CopyButton
        a11yLabel="Copiar código de sala"
        toCopy={$room.id}
        className="w-5 h-5"
      />
    </p>
  </header>

  <div class="flex flex-col gap-4 md:flex-row md:gap-16 md:justify-around">
    <div class="flex flex-col items-center">
      <h3 class="text-3xl mb-4">Jugadores</h3>
      <ul class="flex flex-col gap-1 mb-4">
        {#each $players as player}
          <li class="flex items-center gap-4 w-72">
            <div
              class="grid place-items-center w-8 h-8 text-xl font-mono [&>*]:font-black rounded-md bg-white"
            >
              {#if player.role === PLAYER_ROLE.HOST}
                <span class="text-black">A</span>
              {:else}
                <span class="text-black">I</span>
              {/if}
            </div>
            <span class="text-lg">{player.name}</span>
            <div class="ml-auto">
              <label for="ready-{player.userId}" class="sr-only">Listo</label>
              {#if player.userId === $user?.id}
                <input
                  type="checkbox"
                  id="ready-{player.userId}"
                  on:change={(e) => {
                    dispatchToggleReady(e.currentTarget.checked);
                  }}
                  class="form-checkbox text-success-500 w-6 h-6 rounded-md cursor-pointer"
                />
              {:else}
                {#if isHost}
                  <button
                    type="button"
                    on:click={() => askForKickPlayer(player)}
                    class="btn btn-sm variant-filled variant-filled-error variant-outline-primary"
                  >
                    Expulsar
                  </button>
                {/if}
                <input
                  type="checkbox"
                  id="ready-{player.userId}"
                  checked={player.ready}
                  disabled
                  class="form-checkbox text-success-500 w-6 h-6 rounded-md cursor-not-allowed"
                />
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    </div>

    <div class="flex flex-col items-center">
      <h3 class="text-3xl mb-4">Partida</h3>
      <form
        on:submit={dispatchUpdateSettings}
        class="flex flex-col items-center gap-4 mb-8"
      >
        <div class="w-full">
          <label class="flex items-center justify-between">
            Rondas
            <input
              type="number"
              id="rounds"
              bind:value={selectedSettings.rounds}
              min="5"
              max="10"
              disabled={isInvited}
              class="input w-16 ml-4 bg-black"
            />
          </label>
        </div>
        <div class="w-full">
          <label class="flex items-center justify-between">
            Segs. de eleccion
            <input
              type="number"
              id="timer"
              bind:value={selectedSettings.selectionTime}
              min="1"
              max="30"
              disabled={isInvited}
              class="input w-16 ml-4 bg-black"
            />
          </label>
        </div>
        {#if selectedDeck.type === DECK_TYPE.CHOOSE}
          <div class="w-full">
            <label class="flex items-center justify-between">
              Opciones
              <input
                type="number"
                id="options"
                bind:value={selectedSettings.options}
                min="4"
                max="8"
                disabled={isInvited}
                class="input w-16 ml-4 bg-black"
              />
            </label>
          </div>
        {/if}
        <div class="w-full">
          <label class="flex items-center justify-between">
            <span>Baraja</span>
            <select
              disabled={isInvited}
              on:change={(e) => {
                selectDeck({ deckId: e.currentTarget.value });
              }}
              class="select ml-4 bg-black [&>option]:bg-black"
            >
              {#each $availableDecks as deck}
                <option
                  value={deck.id}
                  selected={deck.id === $game.deck.id}
                  title={deck.description}
                  on:change={() => {
                    alert('cambio');
                    selectDeck({ deckId: deck.id });
                  }}
                >
                  {deck.name}
                </option>
              {/each}
            </select>
          </label>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row-reverse sm:gap-4 md:mt-4">
          {#if isHost}
            <button
              type="button"
              on:click={triggerStartGame}
              class="btn variant-filled variant-filled-success variant-outline-primary"
            >
              Iniciar partida
            </button>
            <button
              type="button"
              on:click={askForCloseRoom}
              class="btn variant-filled variant-filled-error variant-outline-primary"
            >
              Cerrar sala
            </button>
          {:else}
            <p class="text-xl text-center">Esperando al inicio de partida...</p>
          {/if}
        </div>
      </form>
    </div>
  </div>
</section>
