<script lang="ts">
  import { user } from '$lib/stores/user.js';
  import { socket } from '$lib/ws/index.js';

  export let data;

  // if (data.name) {
  //   registerUser({ userId: data.userId, name: data.name });
  // }

  let name: string = data.name ?? '';

  function registerUser(data: { userId?: string; name: string }) {
    socket.emit('register_user', data);
  }

  async function signIn() {
    registerUser({ name: name });
  }

  async function signOut() {
    await fetch('/api/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: undefined, userId: undefined }),
    });
    socket.emit('unregister_user', { userId: user.peek?.id! });
  }

  function createRoom() {
    const userId = user.peek?.id!;
    socket.emit('create_room', { userId: userId });
  }

  let roomId = '';

  function joinRoom() {
    const userId = user.peek?.id!;
    socket.emit('join_room', { roomId: roomId, userId: userId });
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
        src="/logo.png"
        alt="Logo de One More Chance"
        class="mb-6 max-w-full max-h-64 md:max-h-96"
      />
    </div>

    <div class="flex flex-col justify-items-center items-center">
      {#if !$user}
        <form
          on:submit|preventDefault={signIn}
          class="flex flex-col items-center space-y-2"
        >
          <label for="name" class="text-lg">
            <input
              type="text"
              name="name"
              id="name"
              bind:value={name}
              class="block w-full mb-4 mt-1 p-2 bg-black text-white border border-white rounded-lg"
              placeholder="Ingresa tu nombre"
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
      {/if}
    </div>
  </div>
</main>
