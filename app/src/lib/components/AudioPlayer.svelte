<script lang="ts">
  import { audioPlayer } from '$lib/stores/audio.js';
  import { onMount } from 'svelte';

  $: a11yLabel = $audioPlayer.isPlaying ? 'Silenciar audio' : 'Activar audio';

  function toggleAudio() {
    if ($audioPlayer.isPlaying) {
      audioPlayer.stop();
    } else {
      audioPlayer.play('music_lobby.mp3', true);
    }
  }

  onMount(() => {
    audioPlayer.preLoadAudio('music_lobby.mp3');
    audioPlayer.setVolume(0.5);
  });
</script>

<button
  class="fixed top-2 right-2 w-7 h-7 md:top-4 md:right-4 bg-transparent md:w-8 md:h-8 [&>img]:w-full [&>img]:h-full"
  on:click={toggleAudio}
>
  <span class="sr-only">{a11yLabel}</span>
  <div class="w-full h-full" style=" filter: brightness(0) invert(1);">
    {#if $audioPlayer.isPlaying}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-volume-2 w-full h-full"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-volume-x w-full h-full"
      >
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="22" x2="16" y1="9" y2="15" />
        <line x1="16" x2="22" y1="9" y2="15" />
      </svg>
    {/if}
  </div>
</button>
