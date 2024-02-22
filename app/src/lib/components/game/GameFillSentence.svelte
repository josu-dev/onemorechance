<script lang="ts">
  import CountDown from '$comps/game/CountDown.svelte';
  import type { GameStore, Option } from '$game/types.js';
  import { audioPlayer } from '$lib/stores/audio.js';
  import { createEventDispatcher } from 'svelte';
  import SentenceCard from './sentence/SentenceCard.svelte';
  import SentenceComplete from './sentence/SentenceComplete.svelte';

  const DEBOUNCE_TIME = 500;

  export let game: GameStore;

  let countDownDuration = $game.settings.fillTime;
  let currentFill: number = 0;

  let thisSentenceCard: SentenceCard;

  $: totalFills = $game.current.sentence.text.match(/{{.*?}}/g)?.length ?? 0;
  let baseSentence = $game.current.sentence;

  let fills = Array(totalFills).fill('');

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
</script>

<section class="flex flex-1 flex-col justify-center w-full px-4">
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

  <div
    class="grid gap-4 mx-auto grid-rows-3 md:grid-cols-2 md:gap-16 md:justify-around"
  >
    <div
      class="row-span-2 flex flex-col items-center w-full max-w-sm md:row-span-3"
    >
      <SentenceCard
        current={currentFill}
        sentence={baseSentence.text}
        onSelected={(event) => {
          currentFill = event.idx;
        }}
        bind:this={thisSentenceCard}
      />
    </div>

    <div class="flex flex-col items-center w-full max-w-sm md:row-span-3">
      <SentenceComplete
        current={currentFill}
        totalInputs={totalFills}
        onFill={(event) => {
          currentFill = event.idx;
          thisSentenceCard?.setFill(event.idx, event.text);
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
