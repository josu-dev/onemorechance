<script lang="ts">
  import CountDown from '$comps/game/CountDown.svelte';
  import type {
    DeckType,
    GameStore,
    Option,
    PlayerRating,
    PlayersStore,
  } from '$game/types.js';
  import { audioPlayer } from '$lib/stores/audio.js';
  import { DECK_TYPE, PLAYER_RATING } from '$shared/constants.js';
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

  function fillSentence(
    sentence: string,
    type: DeckType,
    option?: Option[],
    freestyle?: string[],
  ) {
    // TODO: handle more than one value cases
    if (type === DECK_TYPE.SELECT) {
      if (!option || !option.length) {
        return sentence.replace(/{{}}/g, '...');
      }
      return sentence.replace(/{{}}/g, option[0].text);
    }

    if (!freestyle || !freestyle.length) {
      return sentence.replace(/{{}}/g, '...');
    }
    return sentence.replace(/{{}}/g, freestyle[0]);
  }
</script>

<section class="flex flex-1 flex-col justify-center items-center">
  <header class="flex flex-col text-center mb-4 md:mb-8">
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

  <div class="flex flex-col gap-4 md:gap-8 md:justify-around">
    <div class="flex flex-col items-center">
      {#each $players as player (player.id)}
        {#if player.id === ratingPlayer}
          <div class="card variant-primary w-[18rem] h-[24rem]">
            <p
              class="text-center text-pretty text-2xl line-clamp-[10] break-all"
            >
              “{fillSentence(
                $game.current.phrase.text,
                $game.deck.type,
                player.current.option,
                player.current.freestyle,
              )}“
            </p>
          </div>
        {/if}
      {/each}
    </div>

    <div class="flex items-center justify-center gap-6 text-3xl md:gap-10">
      <button
        data-selected={rating === PLAYER_RATING.GOD}
        disabled={reacted}
        on:click={() => dispatchRate(PLAYER_RATING.GOD)}
        class="reaction-button"
      >
        🤣
      </button>
      <button
        data-selected={rating === PLAYER_RATING.MEH}
        disabled={reacted}
        on:click={() => dispatchRate(PLAYER_RATING.MEH)}
        class="reaction-button"
      >
        😐
      </button>
      <button
        data-selected={rating === PLAYER_RATING.BAD}
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
    @apply relative px-1 pt-2 pb-0.5 rounded-full;
  }
  .reaction-button:disabled {
    @apply cursor-not-allowed;
  }
  .reaction-button:disabled[data-selected='false'] {
    @apply opacity-50;
  }
  .reaction-button[data-selected='true']::after {
    @apply absolute top-full left-0 right-0 h-1;
    content: '';
    background-image: linear-gradient(
      to bottom,
      hsla(0, 0%, 100%, 0.75),
      transparent
    );
  }
  .reaction-button[data-selected='true']:hover::after {
    background-image: linear-gradient(
      to bottom,
      hsla(0, 0%, 100%, 1),
      transparent
    );
  }
</style>
