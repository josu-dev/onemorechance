<script lang="ts">
  import { PLAYER_RATING, type PlayerRating } from '$lib/enums.js';
  import { audioPlayer } from '$lib/stores/audio';
  import type { ExposedWritable, Readable } from '$lib/stores/types';
  import type { Game, Option } from '$types';
  import { createEventDispatcher } from 'svelte';

  export let game: ExposedWritable<Game>;
  export let players: Readable<Game['players']>;

  let basePhrase = $game.phrase;
  let emptyPhrase = basePhrase.text.replace(/{{}}/g, '...');

  let options: Option[] = [];
  let option: string | undefined = undefined;
  $: filledOptions =
    (option && basePhrase.text.replace(/{{}}/g, option)) ?? undefined;

  let freestyle: string | undefined = undefined;
  $: filledFreestyle =
    (freestyle && basePhrase.text.replace(/{{}}/g, freestyle)) ?? undefined;

  $: filledPhrase = filledOptions || filledFreestyle || emptyPhrase;

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
  <header class="flex flex-col text-center mb-4 md:mb-12">
    <h2 class="text-4xl text-white font-bold mb-1 md:mb-3">Puntua la frase</h2>
  </header>

  <div class="flex flex-col gap-4 md:flex-row md:gap-16 md:justify-around">
    <div class="flex flex-col items-center">
      {#each $players as player (player.userId)}
        {#if player.userId === $game.ratingPlayer}
          <div
            class="card bg-black border-white border-2 p-4 rounded-lg"
            style="width: 300px; height: 400px;"
          >
            <p class="text-white text-center text-2xl mt-6">
              “{filledPhrase}“
            </p>
          </div>
        {/if}
      {/each}
    </div>

    <div class="flex flex-col items-center">
      <button
        class="mx-2 p-4 text-3xl"
        on:click={() => dispatchRate(PLAYER_RATING.GOD)}>🤣</button
      >
      <button
        class="mx-2 p-4 text-3xl"
        on:click={() => dispatchRate(PLAYER_RATING.MEH)}>😐</button
      >
      <button
        class="mx-2 p-4 text-3xl"
        on:click={() => dispatchRate(PLAYER_RATING.BAD)}>🤮</button
      >
    </div>
  </div>
</section>
