<script lang="ts">
  import { DECK_TYPE } from '$game/enums.js';
  import type { Option } from '$game/types';
  import type { GameStore } from '$game/types.client';
  import { audioPlayer } from '$lib/stores/audio';
  import { debounced } from '$lib/utils/client/functions';
  import { createEventDispatcher, onMount } from 'svelte';

  const DEBOUNCE_TIME = 500;
  const TIMER_UPDATE_RATE = 33;

  export let game: GameStore;
  export let initTimerOnMount = false;

  let basePhrase = $game.current.phrase;
  let emptyPhrase = basePhrase.text.replace(/{{}}/g, '...');

  let options: Option[] = [];
  let option: string | undefined = undefined;
  $: filledOptions =
    (option && basePhrase.text.replace(/{{}}/g, option)) ?? undefined;

  let freestyle: string | undefined = undefined;
  $: filledFreestyle =
    (freestyle && basePhrase.text.replace(/{{}}/g, freestyle)) ?? undefined;

  $: filledPhrase = filledOptions || filledFreestyle || emptyPhrase;

  let last_time = window.performance.now();
  let elapsed = 0;
  let duration = $game.chooseTime;
  let remainingSeconds = ($game.chooseTime / 1000).toString();
  let remainingMilisSeconds = '99';

  let timeoutId: ReturnType<typeof setTimeout>;
  function update() {
    if (elapsed < duration) {
      timeoutId = setTimeout(update, TIMER_UPDATE_RATE);
    } else {
      audioPlayer.play('sfx_round.mp3');
    }

    const time = window.performance.now();
    elapsed += Math.min(time - last_time, duration - elapsed);
    last_time = time;
    remainingSeconds = Math.floor((duration - elapsed) / 1000).toString();
    remainingMilisSeconds = Math.floor((duration - elapsed) % 1000)
      .toString()
      .slice(0, 2)
      .padStart(2, '0');
  }

  onMount(() => {
    if (initTimerOnMount) {
      update();
    }

    return () => {
      clearTimeout(timeoutId);
    };
  });

  const dispatch = createEventDispatcher<{
    freestyle: string;
    option: Option[];
  }>();

  function dispatchFreestyle() {
    if (freestyle === undefined) {
      return;
    }

    dispatch('freestyle', freestyle);
  }
  function dispatchOptions() {
    dispatch('option', options);
  }
</script>

<section
  class="flex flex-1 flex-col justify-center items-center text-fuchsia-200"
>
  <header class="flex flex-col text-center mb-4 md:mb-8">
    <h2 class="text-4xl text-white font-bold mb-1 md:mb-3">
      Completa la frase
    </h2>
    <div
      class="flex justify-center items-end tracking-wider text-primary-100 font-semibold font-mono"
    >
      <span class="text-2xl">{remainingSeconds}</span>
      <span class="tetx-2xl">.</span>
      <span class="text-xl">{remainingMilisSeconds}</span>
    </div>
  </header>

  <div class="flex flex-col gap-4 md:flex-row md:gap-16 md:justify-around">
    <div class="flex flex-col items-center">
      <div
        class="card bg-black border-white border-2 p-4 rounded-lg"
        style="width: 300px; height: 400px;"
      >
        <p class="text-white text-center text-2xl mt-6">
          “{filledPhrase}“
        </p>
      </div>
    </div>

    <div class="flex flex-col items-center">
      {#if $game.deck.type === DECK_TYPE.CHOOSE}
        {#each options as option (option.id)}
          <button
            class="bg-black text-white p-2 rounded-lg mb-2"
            on:click={debounced(
              (event, option) => {
                dispatchOptions();
              },
              DEBOUNCE_TIME,
              option,
            )}
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
          autocomplete="off"
          class="!bg-black text-white p-2 rounded-lg mb-2 variant-outline-primary"
          bind:value={freestyle}
          on:input={debounced((event) => {
            dispatchFreestyle();
          }, DEBOUNCE_TIME)}
        />
      {/if}
    </div>
  </div>
</section>
