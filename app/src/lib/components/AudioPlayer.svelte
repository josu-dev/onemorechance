<script>
  import { onMount, onDestroy } from "svelte";
  import { isPlaying } from "../stores/music"; // Asegúrate de que la ruta sea correcta
 //@ts-ignore
  let audio; 
  //@ts-ignore
  let unsubscribe; 
  

  function toggleAudio() {
    isPlaying.update((value) => !value);
  }

  onMount(() => {
    audio = new Audio("/audio/lobby_music.mp3");
    audio.loop = true;

    unsubscribe = isPlaying.subscribe((value) => {
      if (value) {
        //@ts-ignore
        audio.play(); 
      } else {
        //@ts-ignore
        audio.pause(); //@ts-ignore
      }
    });
  });

  onDestroy(() => {
    unsubscribe();
  });
</script>

<button
  class="fixed top-3 right-3 bg-transparent border-none text-4xl"
  on:click={toggleAudio}
>
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
