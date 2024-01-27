<script lang="ts">
  import { room } from "$lib/stores/room.js";
  import { user } from "$lib/stores/user.js";
  import { socket } from "$lib/ws/index.js";

  let name: string = "";

  function registerUser() {
    socket.emit("register_user", { name: name });
  }

  function create_room() {
    const userId = user.peek?.id!;
    socket.emit("create_room", { userId: userId });
  }

  let roomId: string = "";

  function join_room() {
    const userId = user.peek?.id!;
    socket.emit("join_room", { roomId: roomId, userId: userId });
  }
</script>

<div
  class="text-white bg-black min-h-screen flex flex-col items-center justify-center"
>
  <h1 class="text-4xl font-bold mb-10">ONE MORE CHANCE</h1>
  <img src="/logo.png" alt="Logo" class="mb-6 max-w-full h-auto max-h-96" />

  {#if !$user}
    <form
      on:submit|preventDefault={registerUser}
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
    <h2 class="text-2xl font-semibold mb-4">Hi {$user.name}!</h2>
    <form on:submit|preventDefault={create_room} class="mb-4">
      <button
        type="submit"
        class="btn text-white bg-black rounded-lg w-48 h-10"
        style="box-shadow: 0 0 0 2px white;"
      >
        Crear Sala</button
      >
    </form>
    <form
      on:submit|preventDefault={join_room}
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
  {/if}
</div>
