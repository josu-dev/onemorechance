<script lang="ts">
  import { room, roomUsers } from '$lib/stores/room.js';
  import { user } from '$lib/stores/user.js';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

  export let data;
</script>

{#if !$room || !$user}
  <h1>Room not found</h1>
{:else if data.isHost}
  <h1>Host</h1>
  <p>roomId: <code>{$room.id}</code></p>
{:else}
  <h1>Player</h1>
  <p>roomId: <code>{$room.id}</code></p>
  <p>name: <code>{$user.name}</code></p>
{/if}

<SuperDebug data={{room:$room, players: $roomUsers}} />
