<script lang="ts">
  import { room} from '$lib/stores/room.js';
  import { user } from '$lib/stores/user.js';
  import { socket } from '$lib/ws/index.js';
  console.log(room)

  export let data;

  // if (data.name) {
  //   registerUser({ userId: data.userId, name: data.name });
  // }

  let name: string = '';

  function registerUser(data: { userId?: string; name: string }) {
    socket.emit('register_user', data);
  }

  async function signIn() {
    // const user = await fetch('/api/user', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ name: name }),
    // }).then((res) => res.json());
    registerUser({name:name});
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

  function create_room() {
    const userId = user.peek?.id!;
    socket.emit('create_room', { userId: userId });
  }

  let roomId: string = '';

  function join_room() {
    const userId = user.peek?.id!;
    socket.emit('join_room', { roomId: roomId, userId: userId });
  }
</script>

<h1>One more chance</h1>

{#if !$user}
  <form on:submit|preventDefault={signIn}>
    <label for="name">
      name<br />
      <input type="text" name="name" id="name" bind:value={name} />
    </label>
    <button type="submit">Submit</button>
  </form>
{:else}
  <h2>Hi {$user.name}!</h2>
  <form on:submit|preventDefault={create_room}>
    <button type="submit">Create Room</button>
  </form>
  <form on:submit|preventDefault={join_room}>
    <label for="room_id">Room id:</label><br />
    <input type="text" id="room_id" name="room_id" bind:value={roomId} /><br />
    <button type="submit">Join Room</button>
  </form>
  <form on:submit|preventDefault={signOut}>
    <button type="submit">Eliminar cuenta</button>
  </form>
{/if}
