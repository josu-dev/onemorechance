<script lang="ts">
  import { goto } from '$app/navigation';
  import { debugData } from '$comps/HyperDebug.svelte';
  import { ROOM_STATUS } from '$game/enums.js';
  import {
    room,
    roomActions,
    self,
    selfActions,
    socketActions,
  } from '$game/game.js';
  import { audioPlayer } from '$lib/stores/audio.js';
  import { user } from '$lib/stores/user.js';
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms/client';

  export let data;

  user.mset(data.user);

  onMount(() => {
    if (user.value) {
      self.value.id = user.value.id;
      self.value.name = user.value.name;
      self.sync();
    }

    socketActions.connect();

    debugData.set(audioPlayer);

    function startLobbyMusic() {
      audioPlayer.play('music_lobby.mp3', { loop: true });
      document.removeEventListener('click', startLobbyMusic);
    }

    document.addEventListener('click', startLobbyMusic);

    return () => {
      document.removeEventListener('click', startLobbyMusic);
    };
  });

  const registerSForm = superForm(data.registerForm, {
    onUpdated({ form }) {
      const _user = form.message.user;
      user.mset(_user);
      selfActions.register(_user);
      data.user = _user;
    },
  });

  const deleteSForm = superForm(data.deleteForm, {
    onUpdated({ form }) {
      user.mset(undefined);
      data.user = undefined;
      selfActions.unregister();
    },
  });

  let playMenu = false;

  function togglePlayMenu() {
    playMenu = !playMenu;
  }

  function createRoom() {
    roomActions.createRoom();
  }

  let roomId = '';

  function joinRoom() {
    roomActions.joinRoom(roomId);
  }

  $: if ($room.status === ROOM_STATUS.IN_LOBBY) {
    goto(`/${$room.id}`);
  }

  $: if ($room.status === ROOM_STATUS.CONNECTING) {
    console.log(`Connecting to room ${$room.id}`);
  }
</script>

<svelte:head>
  <title>One More Chance</title>
</svelte:head>

<main
  class="h-full flex flex-col items-center justify-center overflow-y-auto p-1"
>
  <h1 class="text-4xl text-white font-bold text-center mb-2">
    ONE MORE CHANCE
  </h1>

  <div
    class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8"
  >
    <div class="flex my-2">
      <img
        src="/logo/logo-896x896.png"
        alt="Logo de One More Chance"
        class="max-h-[25vh] md:max-h-[40vh]"
      />
    </div>

    <div class="flex flex-col justify-items-center items-center">
      {#if !$user}
        <form
          method="post"
          action="?/account_register"
          use:registerSForm.enhance
          class="flex flex-col items-center gap-4"
        >
          <label for="name" class="">
            <span class="sr-only">Nombre</span>
            <input
              type="text"
              id="name"
              name="name"
              autocomplete="off"
              required
              minlength="3"
              maxlength="24"
              placeholder="tu nombre..."
              class="text-center block w-full bg-black text-white border border-white rounded-md"
            />
          </label>
          <button type="submit" class="button variant-primary w-full">
            Registrar
          </button>
        </form>
      {:else if !playMenu}
        <section class="flex flex-col gap-4 md:gap-6">
          <h2 class="sr-only">Menu principal</h2>
          <p class="text-center text-gray-50 text-2xl font-semibold mb-2">
            Hola {$user.name}!
          </p>
          <button on:click={togglePlayMenu} class="button variant-primary">
            Jugar
          </button>
          <button disabled class="button variant-primary">
            Decks (Proximamente)
          </button>
          <form
            method="post"
            action="?/account_delete"
            use:deleteSForm.enhance
            class="flex flex-row w-full items-center justify-center gap-4"
          >
            <label for="confirm">
              <span class="sr-only">Confirmar</span>
              <input
                type="checkbox"
                id="confirm"
                name="confirm"
                required
                class="form-checkbox text-success-500 w-6 h-6 rounded-md cursor-pointer"
              />
            </label>
            <button type="submit" class="button variant-primary w-full">
              Borrar cuenta
            </button>
          </form>
        </section>
      {:else}
        <section class="flex flex-col gap-4 md:gap-6">
          <form on:submit|preventDefault={createRoom} class="flex">
            <button type="submit" class="button variant-primary w-full">
              Crear sala
            </button>
          </form>
          <form
            on:submit|preventDefault={joinRoom}
            class="flex flex-col items-center gap-2"
          >
            <label for="roomId" class="">
              <span class="sr-only">Codigo de sala</span>
              <input
                type="text"
                id="roomId"
                name="roomId"
                autocomplete="off"
                required
                pattern={'[A-Za-z0-9]{6}'}
                bind:value={roomId}
                placeholder="codigo..."
                class="text-center block w-48 h-10 bg-black text-white border border-white rounded-md"
              />
            </label>
            <button type="submit" class="button variant-primary w-full">
              Unirse a sala
            </button>
          </form>
          <button on:click={togglePlayMenu} class="button variant-primary">
            Volver
          </button>
        </section>
      {/if}
    </div>
  </div>
</main>
