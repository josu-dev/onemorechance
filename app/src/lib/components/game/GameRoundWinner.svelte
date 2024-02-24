<script lang="ts">
  import type { GameStore, Player, PlayersStore } from '$game/types.js';

  export let game: GameStore;
  export let players: PlayersStore;

  let playersCount = 0;

  type RankEntry = {
    player: Player;
    pos: number;
    posLast: number;
    posTotal: number;
    winner: boolean;
  };

  let rank: RankEntry[] = [];
  let rankByTotal: RankEntry[] = [];

  $: {
    playersCount = $players.length;

    rank = new Array(playersCount);

    for (let i = 0; i < playersCount; i++) {
      const player = $players[i];
      const ranked = {
        player: player,
        pos: 0,
        posLast: 0,
        posTotal: 0,
        winner: $game.current.winner === $players[i].id,
      };

      for (let j = 0; j < i; j++) {
        const sortedPlayer = rank[j].player;
        if (sortedPlayer.score >= player.score) {
          ranked.pos++;
        } else {
          rank[j].pos++;
        }
        if (sortedPlayer.scoreLast >= player.scoreLast) {
          ranked.posLast++;
        } else {
          rank[j].posLast++;
        }
        if (sortedPlayer.scoreTotal >= player.scoreTotal) {
          ranked.posTotal++;
        } else {
          rank[j].posTotal++;
        }
      }

      rank[i] = ranked;
    }

    rankByTotal = new Array(playersCount);
    for (let i = 0; i < playersCount; i++) {
      rankByTotal[rank[i].posTotal] = rank[i];
    }
  }

  function positionEmoji(position: number) {
    if (position === 0) {
      return '🥵';
    }
    if (position === playersCount - 1) {
      return '🥶';
    }
    if (position === 1) {
      return '🤤';
    }
    if (position === playersCount - 2) {
      return '😴';
    }
    return '😐';
  }
</script>

<section class="flex flex-1 flex-col justify-center items-center">
  <header class="flex flex-col text-center mb-6 md:mb-8">
    <h2 class="text-4xl text-white font-bold mb-1 md:mb-3">Puntajes</h2>
    <p class="flex justify-center gap-4 text-xl leading-none text-gray-100">
      Ronda
      <span class="font-semibold">{$game.round} / {$game.settings.rounds}</span>
    </p>
  </header>

  <div class="flex flex-col gap-4 md:gap-8 md:justify-around">
    <div class="flex flex-col items-center w-full">
      <h3 class="sr-only">Jugadores</h3>
      <ul
        class="flex flex-col gap-2 mb-4 w-[clamp(16rem,80vw,32rem)] max-w-[90vw] md:max-w-full"
      >
        {#each rankByTotal as { player, pos, posLast, posTotal, winner }, i (player.id)}
          <li
            class="flex items-center gap-2 px-1 text-xl text-gray-200 md:py-1 [&:not(:last-child)]:border-b border-fuchsia-100/50"
          >
            <span class=""
              >{posLast > pos ? '🔼' : posLast === pos ? '➖' : '🔽'}</span
            >
            <span class="text-base font-normal whitespace-pre w-10"
              >{(player.score >= 0 ? '+' : '') + player.score.toString()}</span
            >
            <span>{player.name}</span>
            {#if winner}
              <span>🏆</span>
            {/if}
            <div class="flex gap-2 ml-auto">
              <span class="ml-auto">{player.scoreTotal}</span>
              <span>{positionEmoji(i)}</span>
            </div>
          </li>
        {/each}
      </ul>
    </div>

    <slot name="actions" />
  </div>
</section>
