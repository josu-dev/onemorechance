<script lang="ts">
  import ButtonIcon from '$comps/shared/ButtonIcon.svelte';
  import CopyButton from '$comps/shared/CopyButton.svelte';
  import type {
    DeckIdentifier,
    GameSettings,
    GameStore,
    Player,
    PlayersStore,
    RoomStore,
    SelfStore,
  } from '$game/types.js';
  import IconUser from '$lib/icons/IconUser.svelte';
  import IconUserconfig from '$lib/icons/IconUserconfig.svelte';
  import IconX from '$lib/icons/IconX.svelte';
  import type { DecksStore } from '$lib/stores/decks.ts';
  import { DECK_TYPE } from '$shared/constants.js';
  import { GAME } from '$shared/defaults.js';
  import { createEventDispatcher } from 'svelte';

  export let self: SelfStore;
  export let room: RoomStore;
  export let game: GameStore;
  export let players: PlayersStore;
  export let decks: DecksStore;

  $: isGuest = !$self.player.host;
  $: playersAreReady = $players.every((player) => player.ready);
  $: gameCanStart = playersAreReady && $game.deck.id;

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
    type: DECK_TYPE.COMPLETE,
    description: '',
  } as DeckIdentifier;

  $: if ($game.settings.deckId !== deck.id) {
    const newDeck = $decks.find((deck) => deck.id === $game.settings.deckId);
    if (newDeck) {
      deck = newDeck;
    }
  }

  const dispatch = createEventDispatcher<{
    kick_player: { userId: string };
    toggle_ready: boolean;
    update_deck: { deckId: string };
    update_settings: GameSettings;
    close_room: true;
    leave_room: true;
    start_game: true;
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
    dispatch('start_game', true);
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
      deckId: '',
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
    if (!$game.settings.deckId) {
      alert('Selecciona una baraja');
      return;
    }
    // TODO: Show modal
    if (confirm('¿Estás seguro de iniciar la partida?')) {
      dispatchStartGame();
    }
  }
</script>

<section class="flex flex-col justify-center items-center w-full">
  <header class="flex flex-col text-center mb-4 md:mb-8">
    <h2 class="text-4xl text-white font-bold mb-1 md:mb-3">Sala de espera</h2>
    <p class="flex justify-center gap-2 text-xl text-gray-100 leading-none">
      {$room.id}
      <CopyButton
        copy={$room.id}
        a11yLabel="Copiar codigo de sala"
        className="square-5"
      />
    </p>
  </header>

  <div
    class="flex flex-col w-full max-w-[min(24rem,90vw)] md:max-w-[min(48rem,90vw)]"
  >
    <div
      class="flex flex-col gap-4 max-w-full w-full md:grid md:grid-cols-12 md:gap-8 lg:md:gap-12 md:justify-around"
    >
      <div class="flex flex-col mb-4 md:col-span-7">
        <h3 class="text-center text-3xl text-gray-100 mb-4">Jugadores</h3>
        <ul
          class="flex flex-col gap-2 text-gray-200 w-full md:h-[40vh] md:overflow-y-auto md:p-1"
        >
          {#each $players as player}
            <li
              class="flex justify-between gap-2 max-w-full {player.me
                ? 'bg-purple-500/[0.075] shadow-purple-500/[0.075]'
                : ''}"
              style={player.me
                ? 'box-shadow: 0 0 16px 4px var(--tw-shadow-color);'
                : ''}
            >
              <div
                class="flex items-center gap-4 text-ellipsis max-w-[calc(100%-4rem)]"
              >
                <div
                  class="grid place-items-center square-8 rounded-md bg-black ring-1 ring-gray-300"
                >
                  {#if player.host}
                    <IconUserconfig />
                  {:else}
                    <IconUser />
                  {/if}
                </div>
                <span
                  class="flex-1 text-lg leading-none text-ellipsis overflow-hidden"
                  >{player.name}</span
                >
              </div>

              <div class="flex items-center gap-2">
                <label for="ready-{player.id}" class="sr-only">Listo</label>
                {#if player.me}
                  <input
                    type="checkbox"
                    id="ready-{player.id}"
                    on:change={(e) => {
                      dispatchToggleReady(e.currentTarget.checked);
                    }}
                    class="checkbox variant-primary square-6"
                  />
                {:else}
                  {#if $self.player.host}
                    <ButtonIcon
                      icon={IconX}
                      type="submit"
                      label="Expulsar a {player.name}"
                      size="sm"
                      className="variant-primary inline-block"
                    />
                  {/if}
                  <input
                    type="checkbox"
                    id="ready-{player.id}"
                    checked={player.ready}
                    disabled
                    class="checkbox variant-primary square-6"
                  />
                {/if}
              </div>
            </li>
          {/each}
        </ul>
      </div>

      <div class="flex flex-col items-center mb-4 md:col-span-5">
        <h3 class="text-3xl text-gray-100 mb-4">Partida</h3>
        <form
          on:submit={(e) => {
            e.preventDefault();
            dispatchUpdateSettings();
          }}
          class="flex flex-col gap-4 w-full text-gray-200"
        >
          <div class="w-full">
            <label class="flex items-center justify-between">
              <span>Rondas</span>
              <input
                type="number"
                name="rounds"
                max={GAME.MAX_ROUNDS}
                min={GAME.MIN_ROUNDS}
                disabled={isGuest}
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
                name="fillTime"
                max={GAME.MAX_FILL_TIME / 1000}
                min={GAME.MIN_FILL_TIME / 1000}
                disabled={isGuest}
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
                  max={GAME.MAX_OPTIONS}
                  min={GAME.MIN_OPTIONS}
                  disabled={isGuest}
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
                disabled={isGuest}
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
      class="flex flex-col gap-2 justify-around mt-4 md:flex-row-reverse md:justify-center md:gap-8 md:mt-8"
    >
      {#if $self.player.host}
        <button
          type="button"
          on:click={askForStartGame}
          class="button variant-primary"
          disabled={!gameCanStart}
        >
          {gameCanStart
            ? 'Iniciar partida'
            : playersAreReady
              ? 'Esperando deck'
              : 'Esperando listos'}
        </button>
        <button
          type="button"
          on:click={askForLeaveRoom}
          class="button variant-primary variant-warn"
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
