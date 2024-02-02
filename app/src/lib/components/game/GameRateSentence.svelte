<script lang="ts">
  import {
    DECK_TYPE,
    PLAYER_RATING,
    type DeckType,
    type PlayerRating,
  } from '$lib/enums.js';
  import { audioPlayer } from '$lib/stores/audio';
  import type { ExposedWritable, Readable } from '$lib/stores/types';
  import type { Game } from '$types';
  import { createEventDispatcher } from 'svelte';

  export let game: ExposedWritable<Game>;
  export let players: Readable<Game['players']>;

  function fillSentence(
    sentence: string,
    type: DeckType,
    option?: string,
    freestyle?: string,
  ) {
    if (type === DECK_TYPE.CHOOSE) {
      if (!option) {
        return sentence.replace(/{{}}/g, '...');
      }
      return sentence.replace(/{{}}/g, option);
    }

    if (!freestyle) {
      return sentence.replace(/{{}}/g, '...');
    }
    return sentence.replace(/{{}}/g, freestyle);
  }

  const dispatch = createEventDispatcher<{
    rate: {
      playerId: string;
      rate: PlayerRating;
    };
  }>();

  function dispatchRate(rate: PlayerRating) {
    if (!$game.ratingPlayer) {
      return;
    }

    audioPlayer.setVolume(0.5);

    if (rate === PLAYER_RATING.BAD) {
      audioPlayer.play('sfx_abucheo.mp3');
    } else if (rate === PLAYER_RATING.MEH) {
      audioPlayer.play('sfx_meh.mp3');
    } else {
      audioPlayer.play('sfx_aplauso.mp3');
    }

    dispatch('rate', {
      playerId: $game.ratingPlayer,
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
      {#each $players as player (player.userId)}
        {#if player.userId === $game.ratingPlayer}
          <div
            class="card bg-black border-white border-2 p-4 rounded-lg"
            style="width: 300px; height: 400px;"
          >
            <p class="text-white text-center text-2xl mt-6">
              “{fillSentence(
                $game.phrase.text,
                $game.deck.type,
                player.selectedOption?.text,
                player.freestyle?.[0],
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
