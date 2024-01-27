<script lang="ts">
  import { applyAction, enhance } from "$app/forms";
  import { goto, invalidateAll } from "$app/navigation";
  import { user } from "$lib/stores/user.js";
  import { socket } from "$lib/ws";
  import { room } from "$lib/stores/room.js";

  let name: string = "";
  let loading = false;

  function registerUser() {
    socket.emit("register_user", { name: name });
  }

  function create_room() {
    socket.emit("create_room", { userId: user.peek?.id });
  }

  let roomId: string = "";

  function join_room() {
    loading = true;
    socket.emit("join_room", { roomId: roomId, userId: user.peek?.id });
    loading = false;
  }
</script>

<div class="text-white bg-black min-h-screen flex flex-col items-center justify-center">
  <h1 class="text-4xl font-bold mb-4">One more chance</h1>

  {#if !$user}
    <form
      on:submit|preventDefault={registerUser}
      class="flex flex-col items-center space-y-2"
    >
      <label for="name" class="text-lg">
        Nombre:
        <input type="text" name="name" id="name" bind:value={name} class="block w-full mt-1 p-2 bg-black text-white border border-white rounded" />
      </label>
      <button type="submit" class="py-1 px-2 bg-white text-black rounded">Submit</button>
    </form>
  {:else}
    <h2 class="text-2xl font-semibold mb-4">Hi {$user.name}!</h2>
    <form on:submit|preventDefault={create_room} class="mb-4">
      <button type="button" class="btn variant-filled">Create Room</button>
    </form>
    <form on:submit|preventDefault={join_room} class="flex flex-col items-center space-y-2">
      <label for="room_id" class="text-lg">
        Room id:
        <input type="text" id="room_id" name="room_id" bind:value={roomId} class="block w-full mt-1 p-2 bg-black text-white border border-white rounded" />
      </label>
      <button type="submit" class="py-1 px-2 bg-white text-black rounded">Join Room</button>
    </form>
  {/if}
</div>
