<script lang="ts">
  import { goto } from '$app/navigation';
  import { ROOM_STATUS } from '$game/enums.js';
  import {
    room,
    roomActions,
    self,
    selfActions,
    socketActions,
  } from '$game/game.js';
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
  });

  const signInForm = superForm(data.signUpForm, {
    onUpdated({ form }) {
      const _user = form.message.user;
      user.mset(_user);
      selfActions.register(_user);
    },
  });

  const signOutForm = superForm(data.signOutForm, {
    onUpdated({ form }) {
      user.mset(undefined);
      selfActions.unregister();
    },
  });

  function createRoom() {
    console.log('createRoom', roomActions, self);
    roomActions.createRoom();
  }

  let roomId = '';

  function joinRoom() {
    roomActions.joinRoom(roomId);
  }

  $: if ($room.status === ROOM_STATUS.IN_LOBBY) {
    console.log('room', room);
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
  <h1 class="text-4xl text-white font-bold text-center">ONE MORE CHANCE</h1>

  <div class="flex flex-col md:flex-row items-center justify-center md:gap-8">
    <div class="">
      <img
        src="/logo/logo-896x896.png"
        alt="Logo de One More Chance"
        class="mb-6 max-w-full max-h-64 md:max-h-96"
      />
    </div>

    <div class="flex flex-col justify-items-center items-center">
      {#if !$user}
        <form
          method="post"
          action="?/signIn"
          use:signInForm.enhance
          class="flex flex-col items-center space-y-2"
        >
          <label for="name" class="text-lg">
            <input
              type="text"
              id="name"
              name="name"
              placeholder="Ingresa tu nombre"
              autocomplete="off"
              class="block w-full mb-4 mt-1 p-2 bg-black text-white border border-white rounded-lg"
            />
          </label>
          <button
            type="submit"
            class="btn text-white bg-black rounded-lg w-48 h-10"
            style="box-shadow: 0 0 0 2px white;">Confirmar</button
          >
        </form>
      {:else}
        <h2 class=" text-purple-50 text-2xl font-semibold mb-[1em]">
          Hola {$user.name}!
        </h2>
        <form on:submit|preventDefault={createRoom} class="mb-4">
          <button
            type="submit"
            class="btn text-white bg-black rounded-lg w-48 h-10"
            style="box-shadow: 0 0 0 2px white;"
          >
            Crear Sala</button
          >
        </form>
        <form
          on:submit|preventDefault={joinRoom}
          class="flex flex-col items-center space-y-2"
        >
          <label for="room_id" class="text-lg">
            <input
              type="text"
              id="room_id"
              name="room_id"
              bind:value={roomId}
              class="block w-48 h-10 mb-4 mt-1 p-2 bg-black text-white border border-white rounded-lg"
              placeholder="ID de la sala"
            />
          </label>
          <button
            type="submit"
            class="btn text-white mb-4 bg-black rounded-lg w-48 h-10"
            style="box-shadow: 0 0 0 2px white;">Ingresar a la sala</button
          >
        </form>
        <button
          type="submit"
          class="btn text-white m-4 bg-black rounded-lg w-48 h-10"
          disabled
          style="box-shadow: 0 0 0 2px white;">Decks(Proximamente)</button
        >
        <form
          method="post"
          action="?/signIn"
          use:signOutForm.enhance
          class="flex flex-row justify-center items-center space-x-2"
        >
          <button
            type="submit"
            class="btn text-white bg-black rounded-lg"
            style="box-shadow: 0 0 0 2px white;">Borrar cuenta</button
          >
          <label for="confirm">
            <input
              type="checkbox"
              id="confirm"
              name="confirm"
              required
              class="form-checkbox text-success-500 w-6 h-6 rounded-md cursor-pointer"
            />
          </label>
        </form>
      {/if}
    </div>
  </div>
</main>
