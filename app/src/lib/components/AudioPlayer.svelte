<script lang="ts">
  import { isPlaying } from '$lib/stores/music.js';
  import { onMount } from 'svelte';

  let audio: HTMLAudioElement;

  function toggleAudio() {
    isPlaying.update((value) => !value);
  }

  onMount(() => {
    audio = new Audio('/audio/lobby_music.mp3');
    audio.loop = true;

    const unsubscribe = isPlaying.subscribe((value) => {
      if (value) {
        audio.play();
      } else {
        audio.pause();
      }
    });
    return () => {
      audio.pause();
      unsubscribe();
    };
  });
</script>

<button
  class="fixed top-2 right-2 w-7 h-7 md:top-4 md:right-4 bg-transparent md:w-8 md:h-8 [&>img]:w-full [&>img]:h-full"
  on:click={toggleAudio}
>
  <span class="sr-only">Silenciar/Activar audio</span>
  {#if $isPlaying}
    <img
      src="/audio/volume-muted.svg"
      alt="Unmute"
      style="filter: brightness(0) invert(1);"
    />
  {:else}
    <img
      src="/audio/volume.svg"
      alt="Mute"
      style="filter: brightness(0) invert(1);"
    />
  {/if}
</button>
