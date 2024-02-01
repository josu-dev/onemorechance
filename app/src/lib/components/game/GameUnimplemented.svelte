<script lang="ts">
  import type { GameStatus } from '$lib/enums';

  export let gameStatus: GameStatus;
</script>

<section
  class="flex flex-1 flex-col justify-center items-center text-fuchsia-200"
>
  <header class="flex flex-col text-center mb-4 md:mb-8">
    <h2 class="text-4xl text-white font-bold mb-1 md:mb-3">
      Unhandled game status: {gameStatus}, you shouldnt be seeing this 😅
    </h2>
  </header>
</section>
