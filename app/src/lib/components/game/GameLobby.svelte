<script lang="ts">
  import CopyButton from '$comps/shared/CopyButton.svelte';
  import { GAME } from '$game/configs';
  import { DECK_TYPE, PLAYER_ROLE } from '$game/enums';
  import type { DeckIdentifier } from '$game/types';
  import type {
    DecksStore,
    GameStore,
    Player,
    PlayersStore,
    RoomStore,
    SelfStore,
  } from '$game/types.client';
  import { createEventDispatcher } from 'svelte';

  export let self: SelfStore;
  export let room: RoomStore;
  export let game: GameStore;
  export let players: PlayersStore;
  export let decks: DecksStore;

  $: isHost = $self.role === PLAYER_ROLE.HOST;
  $: isInvited = !isHost;
  $: playersAreReady = $players.every((player) => player.ready);

  let settings = {
    rounds: GAME.DEFAULT_ROUNDS,
    selectionTime: GAME.DEFAULT_SELECTION_TIME,
    options: GAME.DEFAULT_OPTIONS,
    deck: {
      id: '',
      name: '',
      type: 'CHOOSE',
      description: '',
    } as DeckIdentifier,
  };

  $: currentDeck = settings.deck;

  $: if ($game.deck.id !== settings.deck.id) {
    settings.deck = $game.deck;
  }

  const dispatch = createEventDispatcher<{
    toggle_ready: boolean;
    start_game: true;
    close_room: true;
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

    dispatch('update_settings', {
      rounds: settings.rounds,
      selectionTime: settings.selectionTime,
      options: settings.options,
      deckId: settings.deck.id,
    });
  }

  function selectDeck(event: { deckId: string }) {
    const newDeck = $decks.find((deck) => deck.id === event.deckId);
    if (!newDeck) {
      console.error('Deck not found');
      return;
    }
    settings.deck = newDeck;
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

  function askForStartGame() {
    if (!playersAreReady) {
      // TODO: Show info message
      return;
    }
    // TODO: Show modal
    if (confirm('¿Estás seguro de iniciar la partida?')) {
      dispatchStartGame();
    }
  }
</script>

<section
  class="flex flex-1 flex-col justify-center items-center text-fuchsia-200"
>
  <header class="flex flex-col text-center mb-4 md:mb-8">
    <h2 class="text-4xl text-white font-bold mb-1 md:mb-3">Sala de espera</h2>
    <p class="flex justify-center gap-2 text-xl leading-none text-primary-100">
      {$room.id}
      <CopyButton
        copy={$room.id}
        a11yLabel="Copiar código de sala"
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
              <label for="ready-{player.id}" class="sr-only">Listo</label>
              {#if player.id === $self.id}
                <input
                  type="checkbox"
                  id="ready-{player.id}"
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
              bind:value={settings.rounds}
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
              bind:value={settings.selectionTime}
              min="1"
              max="30"
              disabled={isInvited}
              class="input w-16 ml-4 bg-black"
            />
          </label>
        </div>
        {#if currentDeck.type === DECK_TYPE.CHOOSE}
          <div class="w-full">
            <label class="flex items-center justify-between">
              Opciones
              <input
                type="number"
                id="options"
                bind:value={settings.options}
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
              {#each $decks as deck}
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
              on:click={askForStartGame}
              class="btn variant-filled variant-filled-success variant-outline-primary"
              disabled={!playersAreReady}
            >
              {playersAreReady ? 'Iniciar partida' : 'Esperando listos'}
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
