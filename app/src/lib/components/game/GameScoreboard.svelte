<script lang="ts">
  import type { ExposedReadable, Readable } from '$lib/stores/types';
  import type { Game, Player } from '$types';

  export let game: ExposedReadable<Game>;
  export let players: Readable<Player[]>;

  $: playersByScore = $players.toSorted((a, b) => b.score - a.score);
  $: playersCount = playersByScore.length;

  function positionEmoji(position: number) {
    if (position === 0) {
      return '🥵';
    }
    if (position === (playersCount - 1)) {
      return '🥶';
    }
    if (playersCount < 4 || position > 1 || position < (playersCount - 2)) {
      return '😐';
    }
    if (position === 1) {
      return '🤤';
    }
    if (position === (playersCount - 2)) {
      return '😴';
    }
    return '🤮';
  }
</script>

<section
  class="flex flex-1 flex-col justify-center items-center text-fuchsia-200"
>
  <header class="flex flex-col text-center mb-4 md:mb-8">
    <h2 class="text-4xl text-white font-bold mb-1 md:mb-3">Puntajes</h2>
    <p class="flex justify-center gap-2 text-xl leading-none text-primary-100">
      Ronda {$game.round} / {$game.maxRounds}
    </p>
  </header>

  <div class="flex flex-col gap-4 md:gap-16 md:justify-around">
    <div class="flex flex-col items-center">
      <h3 class="text-3xl mb-4 sr-only">Jugadores</h3>
      <ul class="flex flex-col gap-2 mb-4">
        {#each playersByScore as player, i (player.userId)}
          <li
            class="flex items-center gap-4 w-72 text-xl px-1 md:py-1 [&:not(:last-child)]:border-b border-fuchsia-100/50"
          >
            <span class="">{player.name}</span>
            <div class="ml-auto">
              <label for="total-score-{player.userId}" class="sr-only"
                >Puntaje total</label
              >
              <span>{player.totalScore}</span>
              <span>{positionEmoji(i)}</span>
            </div>
          </li>
        {/each}
      </ul>
    </div>

    <slot name="actions" />
  </div>
</section>
