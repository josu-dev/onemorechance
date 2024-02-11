<script lang="ts">
  import { browser } from '$app/environment';
  import { room, roomActions } from '$game/game.js';
  import { useClickOutside } from '$lib/actions/index.js';
  import { audioPlayer } from '$lib/stores/audio.js';
  import { ROOM_STATUS_CLIENT } from '$shared/constants.js';

  let menuButton: HTMLButtonElement;

  let open = false;

  function toggleOpen() {
    open = !open;
  }

  let isFullscreen = browser && document.fullscreenElement !== null;

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
      isFullscreen = false;
    } else {
      document.documentElement.requestFullscreen();
      isFullscreen = true;
    }
  }

  $: inRoom =
    $room.status === ROOM_STATUS_CLIENT.WAITING ||
    $room.status === ROOM_STATUS_CLIENT.GAME_ON;

  function leaveRoom() {
    roomActions.leaveRoom();
  }
</script>

<div class="relative flex flex-col">
  <button bind:this={menuButton} on:click={toggleOpen}>
    <span class="sr-only">Menu</span>
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
      class="lucide lucide-menu icon-primary"
      ><line x1="4" x2="20" y1="12" y2="12" /><line
        x1="4"
        x2="20"
        y1="6"
        y2="6"
      /><line x1="4" x2="20" y1="18" y2="18" /></svg
    >
  </button>

  {#if open}
    <div
      use:useClickOutside={{ exclude: menuButton, handler: toggleOpen }}
      class="absolute right-0 top-[125%] min-w-[clamp(8rem,90vw,16rem)] sm:min-w-64 p-1 bg-black text-gray-300 ring-1 ring-gray-300 rounded-md overflow-hidden"
    >
      <div class="p-1">Menu</div>
      <div class="mb-0.5 border-b border-gray-300/50"></div>
      <div class="p-1">
        <div class="flex justify-between">
          <span>Audio</span>
          <button on:click={audioPlayer.toggleMute}>
            {#if $audioPlayer.isMuted}
              <svg
                aria-label="Desmutear"
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
                ><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><line
                  x1="22"
                  x2="16"
                  y1="9"
                  y2="15"
                /><line x1="16" x2="22" y1="9" y2="15" /></svg
              >
            {:else}
              <svg
                aria-label="Mutear"
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
                ><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path
                  d="M15.54 8.46a5 5 0 0 1 0 7.07"
                /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg
              >
            {/if}
          </button>
        </div>
        <div class="flex flex-col">
          <label class="flex flex-row flex-wrap">
            <span class="w-24">General</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={$audioPlayer.volume * 100}
              on:input={(e) => {
                audioPlayer.setVolume(parseInt(e.currentTarget.value) / 100);
              }}
              class="w-32 mx-auto accent-purple-700"
            />
          </label>
          <label class="flex flex-row flex-wrap">
            <span class="w-24">Musica</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={$audioPlayer.volumeMusic * 100}
              on:input={(e) => {
                audioPlayer.setVolumeMusic(
                  parseInt(e.currentTarget.value) / 100,
                );
              }}
              class="w-32 mx-auto accent-purple-700"
            />
          </label>
          <label class="flex flex-row flex-wrap">
            <span class="w-24">Efectos</span>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={$audioPlayer.volumeSfx * 100}
              on:input={(e) => {
                audioPlayer.setVolumeSfx(parseInt(e.currentTarget.value) / 100);
              }}
              class="w-32 mx-auto accent-purple-700"
            />
          </label>
        </div>
      </div>

      <div class="mb-0.5 border-b border-gray-300/50"></div>

      <div class="p-1">
        <div class="flex justify-between">
          <span>Video</span>
          <button on:click={toggleFullscreen}>
            {#if isFullscreen}
              <svg
                aria-label="Pantalla completa"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-minimize"
                ><path d="M8 3v3a2 2 0 0 1-2 2H3" /><path
                  d="M21 8h-3a2 2 0 0 1-2-2V3"
                /><path d="M3 16h3a2 2 0 0 1 2 2v3" /><path
                  d="M16 21v-3a2 2 0 0 1 2-2h3"
                /></svg
              >
            {:else}
              <svg
                aria-label="Minimizar pantalla completa"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-maximize"
                ><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path
                  d="M21 8V5a2 2 0 0 0-2-2h-3"
                /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path
                  d="M16 21h3a2 2 0 0 0 2-2v-3"
                /></svg
              >
            {/if}
          </button>
        </div>
      </div>

      {#if inRoom}
        <div class="mb-0.5 border-b border-gray-300/50"></div>

        <div class="p-1">
          <!-- <div class="flex justify-between">
            <span>Partida</span>
          </div> -->
          <button on:click={leaveRoom}>Abandonar partida</button>
        </div>
      {/if}
    </div>
  {/if}
</div>
