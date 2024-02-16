<script lang="ts">
  import CopyButton from '$comps/shared/CopyButton.svelte';
  import type {
    DeckCompact,
    DeckIdentifier,
    GameSettings,
    GameStore,
    Player,
    PlayersStore,
    RoomStore,
    SelfStore,
  } from '$game/types.js';
  import type { DecksStore } from '$lib/stores/decks.ts';
  import { logClient } from '$lib/utils/logging.ts';
  import { DECK_TYPE } from '$shared/constants.js';
  import { GAME } from '$shared/defaults.js';
  import { createEventDispatcher } from 'svelte';

  export let self: SelfStore;
  export let room: RoomStore;
  export let game: GameStore;
  export let players: PlayersStore;
  export let decks: DecksStore;

  $: isInvited = !$self.player.host;
  $: playersAreReady = $players.every((player) => player.ready);

  let settings = {
    deckId: '',
    fillTime: GAME.DEFAULT_FILL_TIME,
    rateTime: GAME.DEFAULT_RATE_TIME,
    options: GAME.DEFAULT_OPTIONS,
    players: GAME.DEFAULT_PLAYERS,
    rounds: GAME.DEFAULT_ROUNDS,
  };

  let deck = {
    id: '',
    name: '',
    type: 'SELECT',
    description: '',
  } as DeckIdentifier;

  let deckData: DeckCompact = {
    id: deck.id,
    n: deck.name,
    t: deck.type,
    d: deck.description,
    s: [],
  };

  function fetchDeckData(id: string) {
    fetch(
      `/api/v1/decks/${id}?compact=true&random=true&limit=${
        settings.rounds * 2
      }`,
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error fetching deck data', { cause: res });
        }
        return res.json();
      })
      .then((data) => {
        deckData.id = data.d.id;
        deckData.n = data.d.n;
        deckData.t = data.d.t;
        deckData.d = data.d.d;
        deckData.s = data.s;
      })
      .catch((err) => {
        logClient.error('Error fetching deck data', err);
      });
  }

  $: if ($game.settings.deckId !== deck.id) {
    const newDeck = $decks.find((deck) => deck.id === $game.settings.deckId);
    if (newDeck) {
      deck = newDeck;
      $game.deck.id = newDeck.id;
    }
  }

  const dispatch = createEventDispatcher<{
    kick_player: { userId: string };
    toggle_ready: boolean;
    update_deck: { deckId: string };
    update_settings: GameSettings;
    close_room: true;
    leave_room: true;
    start_game: DeckCompact;
  }>();

  function dispatchCloseRoom() {
    dispatch('close_room', true);
  }
  function dispatchKickPlayer(player: { userId: string }) {
    dispatch('kick_player', player);
  }
  function dispatchLeaveRoom() {
    dispatch('leave_room', true);
  }
  function dispatchStartGame() {
    dispatch('start_game', deckData);
  }
  function dispatchToggleReady(state: boolean) {
    dispatch('toggle_ready', state);
  }
  function dispatchUpdateSettings() {
    dispatch('update_settings', {
      deckId: settings.deckId,
      fillTime: settings.fillTime,
      rateTime: settings.rateTime,
      options: settings.options,
      players: settings.players,
      rounds: settings.rounds,
    });
  }

  function resetSettings() {
    settings = {
      deckId: GAME.DEFAULT_DECK_ID,
      fillTime: GAME.DEFAULT_FILL_TIME,
      rateTime: GAME.DEFAULT_RATE_TIME,
      options: GAME.DEFAULT_OPTIONS,
      players: GAME.DEFAULT_PLAYERS,
      rounds: GAME.DEFAULT_ROUNDS,
    };
    dispatchUpdateSettings();
  }

  function selectDeck(id: string) {
    const newDeck = $decks.find((deck) => deck.id === id);
    if (!newDeck) {
      console.error('Deck not found');
      return;
    }

    deck = newDeck;
    settings.deckId = newDeck.id;
    fetchDeckData(newDeck.id);
  }

  function askForKickPlayer(player: Player) {
    // TODO: Show modal
    if (confirm(`¿Estás seguro de expulsar a ${player.name}?`)) {
      dispatchKickPlayer({ userId: player.id });
    }
  }

  function askForCloseRoom() {
    // TODO: Show modal
    if (confirm('¿Estás seguro de cerrar la sala?')) {
      dispatchCloseRoom();
    }
  }

  function askForLeaveRoom() {
    // TODO: Show modal
    if (confirm('¿Estás seguro de salir de la sala?')) {
      dispatchLeaveRoom();
    }
  }

  function askForStartGame() {
    if (!playersAreReady) {
      // TODO: Show info message
      return;
    }
    if (!deckData.id) {
      alert('Selecciona una baraja');
      return;
    }
    // TODO: Show modal
    if (confirm('¿Estás seguro de iniciar la partida?')) {
      dispatchStartGame();
    }
  }
</script>

<section class="flex flex-1 flex-col justify-center items-center">
  <header class="flex flex-col text-center mb-4 md:mb-8">
    <h2 class="text-4xl text-white font-bold mb-1 md:mb-3">Sala de espera</h2>
    <p class="flex justify-center gap-2 text-xl text-gray-100 leading-none">
      {$room.id}
      <CopyButton
        copy={$room.id}
        a11yLabel="Copiar código de sala"
        className="w-5 h-5"
      />
    </p>
  </header>

  <div class="flex flex-col md:justify-around">
    <div class="flex flex-col gap-4 md:flex-row md:gap-16 md:justify-around">
      <div class="flex flex-col items-center mb-4">
        <h3 class="text-3xl text-gray-100 mb-4">Jugadores</h3>
        <ul class="flex flex-col gap-1 text-gray-200">
          {#each $players as player}
            <li class="flex items-center gap-4 w-72">
              <div
                class="grid place-items-center w-8 h-8 text-xl font-mono [&>*]:font-black rounded-md bg-white"
              >
                {#if player.host}
                  <span class="text-black">A</span>
                {:else}
                  <span class="text-black">I</span>
                {/if}
              </div>
              <span class="text-lg">{player.name}</span>
              <div class="ml-auto">
                <label for="ready-{player.id}" class="sr-only">Listo</label>
                {#if player.me}
                  <input
                    type="checkbox"
                    id="ready-{player.id}"
                    on:change={(e) => {
                      dispatchToggleReady(e.currentTarget.checked);
                    }}
                    class="form-checkbox text-success-500 w-6 h-6 rounded-md cursor-pointer"
                  />
                {:else}
                  {#if $self.player.host}
                    <button
                      type="button"
                      on:click={() => askForKickPlayer(player)}
                      class="button variant-primary"
                    >
                      Expulsar
                    </button>
                  {/if}
                  <input
                    type="checkbox"
                    id="ready-{player.id}"
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

      <div class="flex flex-col items-center mb-4">
        <h3 class="text-3xl text-gray-100 mb-4">Partida</h3>
        <form
          on:submit={(e) => {
            e.preventDefault();
            dispatchUpdateSettings();
          }}
          class="flex flex-col items-center gap-4 text-gray-200"
        >
          <div class="w-full">
            <label class="flex items-center justify-between">
              <span>Rondas</span>
              <input
                type="number"
                name="rounds"
                max="10"
                min="5"
                disabled={isInvited}
                bind:value={settings.rounds}
                class="input variant-primary w-20 ml-4"
              />
            </label>
          </div>
          <div class="w-full">
            <label class="flex items-center justify-between">
              <span>Segs. de eleccion</span>
              <input
                type="number"
                disabled={isInvited}
                name="fillTime"
                max="30"
                min="1"
                value={settings.fillTime / 1000}
                on:change={(e) => {
                  settings.fillTime = parseInt(e.currentTarget.value) * 1000;
                }}
                class="input variant-primary w-20 ml-4"
              />
            </label>
          </div>
          {#if deck.type === DECK_TYPE.SELECT}
            <div class="w-full">
              <label class="flex items-center justify-between">
                <span>Opciones</span>
                <input
                  type="number"
                  max="8"
                  min="4"
                  disabled={isInvited}
                  bind:value={settings.options}
                  class="input variant-primary w-20 ml-4"
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
                  selectDeck(e.currentTarget.value);
                }}
                class="select variant-primary w-48 ml-4 overflow-hidden text-ellipsis"
              >
                <option title="Sin seleccionar" value="">
                  Sin seleccionar
                </option>
                {#each $decks as deck}
                  {#if deck.type === DECK_TYPE.COMPLETE}
                    <option
                      selected={deck.id === $game.deck.id}
                      title={deck.description}
                      value={deck.id}
                    >
                      {deck.name}
                    </option>
                  {/if}
                {/each}
              </select>
            </label>
          </div>

          {#if $self.player.host}
            <div
              class="flex flex-wrap flex-row-reverse justify-around gap-2 w-full sm:gap-4 md:mt-4"
            >
              <button type="submit" class="button variant-primary">
                Actualizar
              </button>
              <button
                type="button"
                on:click={resetSettings}
                class="button variant-primary variant-error"
              >
                Reiniciar
              </button>
            </div>
          {/if}
        </form>
      </div>
    </div>

    <div
      class="flex flex-col gap-2 sm:flex-row-reverse sm:gap-4 mt-4 md:mt-8 justify-around"
    >
      {#if $self.player.host}
        <button
          type="button"
          on:click={askForStartGame}
          class="button variant-primary"
          disabled={!playersAreReady}
        >
          {playersAreReady ? 'Iniciar partida' : 'Esperando listos'}
        </button>
        <button
          type="button"
          on:click={askForLeaveRoom}
          class="button variant-primary variant-error"
        >
          Abandonar sala
        </button>
        <button
          type="button"
          on:click={askForCloseRoom}
          class="button variant-primary variant-error"
        >
          Cerrar sala
        </button>
      {:else}
        <p class="my-auto text-gray-300 text-xl text-center">
          {playersAreReady ? 'Esperando al anfitrion' : 'Esperando listos'}
        </p>
        <button
          type="button"
          on:click={askForLeaveRoom}
          class="button variant-primary variant-error"
        >
          Abandonar sala
        </button>
      {/if}
    </div>
  </div>
</section>
