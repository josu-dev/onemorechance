<script lang="ts">
  import { browser } from '$app/environment';
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import { room, roomActions } from '$game/game.js';
  import { useClickOutside } from '$lib/actions/index.js';
  import IconMaximize from '$lib/icons/IconMaximize.svelte';
  import IconMenu from '$lib/icons/IconMenu.svelte';
  import IconMinimize from '$lib/icons/IconMinimize.svelte';
  import IconVolume from '$lib/icons/IconVolume.svelte';
  import IconVolumex from '$lib/icons/IconVolumex.svelte';
  import { audioPlayer } from '$lib/stores/audio.js';
  import { user } from '$lib/stores/user.js';
  import { log } from '$lib/utils/logging.ts';
  import { ROOM_STATUS_CLIENT } from '$shared/constants.js';
  import type { SubmitFunction } from '@sveltejs/kit';
  import toast from 'svelte-french-toast';

  let menuButton: HTMLButtonElement;

  let open = false;

  function toggleOpen() {
    open = !open;
  }

  $: inRoom =
    $room.status === ROOM_STATUS_CLIENT.WAITING ||
    $room.status === ROOM_STATUS_CLIENT.GAME_ON;

  function gotoHome() {
    goto('/');
  }

  let pendingClose = false;
  function leaveRoom() {
    pendingClose = true;
    roomActions.leaveRoom();
  }

  $: if (pendingClose && $room.status === ROOM_STATUS_CLIENT.LEFT) {
    pendingClose = false;
    open = false;
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

  const enhanceDeleteAccount: SubmitFunction = ({}) => {
    return ({ result }) => {
      if (result.type === 'success') {
        open = false;
        user.mset(undefined);
        goto('/');
        return;
      }

      log.error('Error al borrar la cuenta', result);
      toast.error('Error al borrar la cuenta', { duration: 5000 });
    };
  };
</script>

<header
  class="fixed top-0 right-0 left-0 z-10 h-[var(--header-height)] flex justify-between p-2 md:px-4 md:pt-4 lg:px-8 pointer-events-none"
>
  <div class="pointer-events-auto flex">
    <button
      disabled={inRoom}
      title={inRoom ? undefined : 'Inicio'}
      on:click={gotoHome}
      class="h-full transition-all hover:brightness-150 disabled:cursor-not-allowed disabled:hover:brightness-75"
    >
      <span class="sr-only">Inicio</span>
      <img
        src="/logo/logo-64x64.png"
        alt="Logo de One More Chance"
        class="aspect-square h-full"
      />
    </button>
  </div>

  <div class="pointer-events-auto relative flex flex-col">
    <button
      bind:this={menuButton}
      on:click={toggleOpen}
      title="Menu"
      class="h-full [&>svg]:h-full [&>svg]:w-full"
    >
      <span class="sr-only">Menu</span>
      <IconMenu />
    </button>

    {#if open}
      <div
        use:useClickOutside={{ exclude: menuButton, handler: toggleOpen }}
        class="absolute right-0 top-[125%] min-w-[clamp(8rem,90vw,16rem)] sm:min-w-64 p-1 bg-black text-gray-300 ring-1 ring-gray-300 rounded-md overflow-hidden"
      >
        <div class="py-0.5 font-bold text-lg text-center">Menu</div>
        <div class="category-divider" />

        <div class="p-1">
          <div class="flex justify-between">
            <span class="font-semibold text-lg">Audio</span>
            <button
              on:click={audioPlayer.toggleMute}
              title={$audioPlayer.isMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {#if $audioPlayer.isMuted}
                <IconVolumex />
              {:else}
                <IconVolume />
              {/if}
            </button>
          </div>
          <div class="flex flex-col">
            <label class="flex flex-row flex-wrap hover:text-gray-100">
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
            <label class="flex flex-row flex-wrap hover:text-gray-100">
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
            <label class="flex flex-row flex-wrap hover:text-gray-100">
              <span class="w-24">Efectos</span>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={$audioPlayer.volumeSfx * 100}
                on:input={(e) => {
                  audioPlayer.setVolumeSfx(
                    parseInt(e.currentTarget.value) / 100,
                  );
                }}
                class="w-32 mx-auto accent-purple-700"
              />
            </label>
          </div>
        </div>
        <div class="category-divider" />

        <div class="p-1">
          <div class="flex justify-between">
            <span class="font-semibold text-lg">Video</span>
            <button
              on:click={toggleFullscreen}
              title={isFullscreen
                ? 'Salir de pantalla completa'
                : 'Pantalla completa'}
            >
              <span class="sr-only">
                {isFullscreen
                  ? 'Salir de pantalla completa'
                  : 'Pantalla completa'}
              </span>
              {#if isFullscreen}
                <IconMinimize />
              {:else}
                <IconMaximize />
              {/if}
            </button>
          </div>
        </div>

        {#if $user}
          <div class="category-divider" />
          <div class="p-1">
            <div class="flex justify-between">
              <span class="font-semibold text-lg">Cuenta</span>
            </div>
            <div class="flex flex-col">
              <form
                action="/?/account_delete"
                method="post"
                use:enhance={enhanceDeleteAccount}
                class="group w-max flex gap-4"
              >
                <button type="submit" class="menu-button">
                  Borrar cuenta
                </button>
                <label>
                  <span class="sr-only">Confirmar</span>
                  <input
                    type="checkbox"
                    name="confirm"
                    required
                    class="form-checkbox text-purple-700 w-5 h-5 rounded-md cursor-pointer"
                  />
                </label>
              </form>
            </div>
          </div>
        {/if}

        {#if inRoom}
          <div class="category-divider" />
          <div class="p-1">
            <div class="flex flex-col">
              <div class="group w-max">
                <button on:click={leaveRoom} class="menu-button">
                  Abandonar partida
                </button>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</header>

<style lang="postcss">
  .menu-button {
    @apply underline underline-offset-2 transition-all;
  }

  .group:hover .menu-button {
    @apply text-gray-100 decoration-2 underline-offset-4;
  }

  .category-divider {
    @apply mb-0.5 border-b border-gray-300/50;
  }
</style>
