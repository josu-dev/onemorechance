<script lang="ts">
  import CountDown from '$comps/game/CountDown.svelte';
  import { FILL_SENTENCE_DEBOUNCE } from '$comps/game/defaults.js';
  import SentenceComplete from '$comps/game/sentence/SentenceComplete.svelte';
  import SentenceFillCard from '$comps/game/sentence/SentenceFillCard.svelte';
  import { countFillSlots } from '$comps/game/sentence/shared.js';
  import type { GameStore, Option } from '$game/types.js';
  import { audioPlayer } from '$lib/stores/audio.js';
  import { debounced } from '$lib/utils/client/functions.js';
  import { createEventDispatcher, onMount } from 'svelte';

  export let game: GameStore;

  const baseSentence = { ...$game.current.sentence };

  let countDownDuration = $game.settings.fillTime;

  let currentFill = -1;
  $: totalFills = countFillSlots($game.current.sentence.text);

  let fills: string[] = Array(totalFills).fill('');

  let thisSentenceCard: SentenceFillCard;

  const dispatch = createEventDispatcher<{
    freestyle: string[];
    option: Option[];
  }>();

  const dispatchFreestyle = debounced(() => {
    dispatch('freestyle', fills);
  }, FILL_SENTENCE_DEBOUNCE);

  onMount(() => {
    return () => {
      dispatchFreestyle.cancel();
      dispatch('freestyle', fills);
    };
  });
</script>

<section class="flex flex-1 flex-col justify-center items-center w-full px-4">
  <header class="flex flex-col text-center mb-6 md:mb-8">
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

  <div
    class="grid grid-rows-3 gap-4 grid-cols-[min(calc(90vw_-1rem),24rem)] mx-auto md:w-[min(calc(90vw_-1rem),calc(24rem*2+4rem))] md:grid-cols-2 md:gap-16 md:justify-around"
  >
    <div class="row-span-2 md:row-span-3">
      <SentenceFillCard
        current={currentFill}
        sentence={baseSentence.text}
        onSelected={(event) => {
          currentFill = event.idx;
        }}
        bind:this={thisSentenceCard}
      />
    </div>

    <div class="md:row-span-3 md:my-auto">
      <SentenceComplete
        current={currentFill}
        totalInputs={totalFills}
        onFill={(event) => {
          currentFill = event.idx;
          thisSentenceCard?.setFill(event.idx, event.text);
          fills[event.idx] = event.text;
          dispatchFreestyle();
        }}
        onSelected={(event) => {
          currentFill = event.idx;
        }}
        onUnselected={() => {
          currentFill = -1;
        }}
        onEnter={(event) => {
          currentFill = (event.idx + 1) % totalFills;
        }}
      />
    </div>
  </div>
</section>
