<script lang="ts">
  import type { DeckType, PlayerRating } from '$game/enums';
  import { DECK_TYPE, PLAYER_RATING } from '$game/enums';
  import type { Option } from '$game/types';
  import type { GameStore, PlayersStore } from '$game/types.client';
  import { audioPlayer } from '$lib/stores/audio';
  import { createEventDispatcher } from 'svelte';

  export let game: GameStore;
  export let players: PlayersStore;

  function fillSentence(
    sentence: string,
    type: DeckType,
    option?: Option[],
    freestyle?: string[],
  ) {
    // TODO: handle more than one value cases
    if (type === DECK_TYPE.CHOOSE) {
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

  const dispatch = createEventDispatcher<{
    rate_sentence: {
      playerId: string;
      rate: PlayerRating;
    };
  }>();

  function dispatchRate(rate: PlayerRating) {
    if (!$game.current.ratingPlayer) {
      return;
    }

    if (rate === PLAYER_RATING.BAD) {
      audioPlayer.play('sfx_abucheo.mp3');
    } else if (rate === PLAYER_RATING.MEH) {
      audioPlayer.play('sfx_meh.mp3', { volumeSfx: 2 });
    } else {
      audioPlayer.play('sfx_aplauso.mp3');
    }

    dispatch('rate_sentence', {
      playerId: $game.current.ratingPlayer,
      rate: rate,
    });
  }
</script>

<section
  class="flex flex-1 flex-col justify-center items-center text-fuchsia-200"
>
  <header class="flex flex-col text-center mb-4 md:mb-8">
    <h2 class="text-4xl text-white font-bold mb-1 md:mb-3">Puntua la frase</h2>
  </header>

  <div class="flex flex-col gap-4 md:gap-8 md:justify-around">
    <div class="flex flex-col items-center">
      {#each $players as player (player.id)}
        {#if player.id === $game.current.ratingPlayer}
          <div
            class="card bg-black border-white border-2 p-4 rounded-lg"
            style="width: 300px; height: 400px;"
          >
            <p class="text-white text-center text-2xl mt-6">
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
        class="p-1 rounded-full"
        on:click={() => dispatchRate(PLAYER_RATING.GOD)}>🤣</button
      >
      <button
        class="p-1 rounded-full"
        on:click={() => dispatchRate(PLAYER_RATING.MEH)}>😐</button
      >
      <button
        class="p-1 rounded-full"
        on:click={() => dispatchRate(PLAYER_RATING.BAD)}>🤮</button
      >
    </div>
  </div>
</section>
