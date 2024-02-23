<script lang="ts">
  import CountDown from '$comps/game/CountDown.svelte';
  import SentenceCard from '$comps/game/sentence/SentenceCard.svelte';
  import { generateFillElements } from '$comps/game/sentence/shared.ts';
  import type { GameStore, PlayerRating, PlayersStore } from '$game/types.js';
  import { audioPlayer } from '$lib/stores/audio.js';
  import { PLAYER_RATING } from '$shared/constants.js';
  import { createEventDispatcher } from 'svelte';

  export let game: GameStore;
  export let players: PlayersStore;

  let countDownDuration = $game.settings.rateTime;

  let reacted = false;
  let rating: PlayerRating | undefined = undefined;
  let lastRatedPlayer: string | undefined = undefined;

  $: ratingPlayer = $game.current.ratingPlayer;

  $: if (lastRatedPlayer !== ratingPlayer) {
    lastRatedPlayer = ratingPlayer;
    reacted = false;
    rating = undefined;
  }

  $: [fragments] = generateFillElements($game.current.sentence.text);

  const dispatch = createEventDispatcher<{
    rate_sentence: {
      playerId: string;
      rate: PlayerRating;
    };
  }>();

  function dispatchRate(rate: PlayerRating) {
    if (!ratingPlayer || reacted) {
      return;
    }

    reacted = true;
    rating = rate;

    if (rate === PLAYER_RATING.BAD) {
      audioPlayer.play('sfx_abucheo.mp3');
    } else if (rate === PLAYER_RATING.MEH) {
      audioPlayer.play('sfx_meh.mp3', { volumeSfx: 2 });
    } else {
      audioPlayer.play('sfx_aplauso.mp3');
    }

    dispatch('rate_sentence', {
      playerId: ratingPlayer,
      rate: rate,
    });
  }
</script>

<section class="flex flex-1 flex-col justify-center px-4">
  <header class="flex flex-col text-center mb-6 md:mb-8">
    <h2 class="text-4xl text-white font-bold mb-1 md:mb-3">Puntua la frase</h2>
    {#key ratingPlayer}
      <CountDown
        start
        duration={countDownDuration}
        className="text-gray-100"
        on:end={() => {
          audioPlayer.play('sfx_round.mp3');
        }}
      />
    {/key}
  </header>

  <div class="flex flex-col gap-6 md:gap-8 md:justify-around">
    <div class="grid items-center w-full max-w-sm min-h-[min(28rem,50vh)]">
      {#each $players as player (player.id)}
        {#if player.id === ratingPlayer}
          <SentenceCard>
            {#each fragments as element (element.id)}
              {#if element.type === 'static'}
                {element.text}{:else}
                <span
                  title="Espacio {element.idx + 1}"
                  class="text-gray-300 rounded-md px-2 pt-0.5 ring-1 ring-gray-300/50 font-normal whitespace-pre-wrap hover:ring-2"
                  >{player.current.freestyle?.[element.idx] ||
                    element.text}</span
                >{/if}{/each}</SentenceCard
          >
        {/if}
      {/each}
    </div>

    <div class="flex items-center justify-center gap-6 text-3xl md:gap-10">
      <button
        data-selected={rating === PLAYER_RATING.GOD ? '' : undefined}
        disabled={reacted}
        on:click={() => dispatchRate(PLAYER_RATING.GOD)}
        class="reaction-button"
      >
        🤣
      </button>
      <button
        data-selected={rating === PLAYER_RATING.MEH ? '' : undefined}
        disabled={reacted}
        on:click={() => dispatchRate(PLAYER_RATING.MEH)}
        class="reaction-button"
      >
        😐
      </button>
      <button
        data-selected={rating === PLAYER_RATING.BAD ? '' : undefined}
        disabled={reacted}
        on:click={() => dispatchRate(PLAYER_RATING.BAD)}
        class="reaction-button"
      >
        🤮
      </button>
    </div>
  </div>
</section>

<style lang="postcss">
  .reaction-button {
    @apply relative px-1 pt-2 pb-0.5 rounded-full transition-transform;
  }
  .reaction-button:hover {
    @apply scale-105;
  }
  .reaction-button:disabled {
    @apply cursor-not-allowed;
  }
  .reaction-button:not([data-selected]):disabled {
    @apply opacity-50;
  }
  .reaction-button[data-selected]::after {
    @apply absolute top-full left-0 right-0 h-1;
    content: '';
    background-image: linear-gradient(
      to bottom,
      hsla(0, 0%, 100%, 0.75),
      transparent
    );
  }
  .reaction-button[data-selected]:hover::after {
    background-image: linear-gradient(
      to bottom,
      hsla(0, 0%, 100%, 1),
      transparent
    );
  }
</style>
