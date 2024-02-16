<script lang="ts">
  import CountDown from '$comps/game/CountDown.svelte';
  import type { GameStore, Option } from '$game/types.js';
  import { audioPlayer } from '$lib/stores/audio.js';
  import { debounced } from '$lib/utils/client/functions.js';
  import { DECK_TYPE } from '$shared/constants.js';
  import { createEventDispatcher } from 'svelte';

  const DEBOUNCE_TIME = 500;

  export let game: GameStore;

  let countDownDuration = $game.settings.fillTime;

  let baseSentence = $game.current.sentence;
  let emptySentence = baseSentence.text.replace(/{{}}/g, '...');

  let options: Option[] = [];
  let option: string | undefined = undefined;
  $: filledOptions =
    (option && baseSentence.text.replace(/{{}}/g, option)) ?? undefined;

  let freestyle: string | undefined = undefined;
  $: filledFreestyle =
    (freestyle && baseSentence.text.replace(/{{}}/g, freestyle)) ?? undefined;

  $: filledPhrase = filledOptions || filledFreestyle || emptySentence;

  const dispatch = createEventDispatcher<{
    freestyle: string[];
    option: Option[];
  }>();

  function dispatchFreestyle() {
    if (freestyle === undefined) {
      return;
    }

    // TODO: correctly handled multiple freestyle completions
    dispatch('freestyle', [freestyle]);
  }

  function dispatchOptions() {
    dispatch('option', options);
  }
</script>

<section class="flex flex-1 flex-col justify-center items-center">
  <header class="flex flex-col text-center mb-4 md:mb-8">
    <h2 class="text-4xl text-white font-bold mb-1 md:mb-3">
      Completa la frase
    </h2>
    <CountDown
      start
      duration={countDownDuration}
      className="text-gray-100"
      on:end={() => {
        audioPlayer.play('sfx_round.mp3');
      }}
    />
  </header>

  <div class="flex flex-col gap-4 md:flex-row md:gap-16 md:justify-around">
    <div class="flex flex-col items-center">
      <div class="card variant-primary w-[18rem] h-[24rem]">
        <p class="text-center text-pretty text-2xl line-clamp-[10] break-words">
          “{filledPhrase}“
        </p>
      </div>
    </div>

    <div class="flex flex-col items-center justify-center w-[18rem]">
      {#if $game.deck.type === DECK_TYPE.SELECT}
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
        <label for="freestyleFill" class="sr-only">Completar con</label>
        <textarea
          id="freestyleFill"
          autocomplete="off"
          placeholder="Completar con..."
          rows="3"
          spellcheck="false"
          bind:value={freestyle}
          on:input={debounced((event) => {
            dispatchFreestyle();
          }, DEBOUNCE_TIME)}
          class="input variant-primary resize-none text-xl text-center w-11/12"
        ></textarea>
      {/if}
    </div>
  </div>
</section>
