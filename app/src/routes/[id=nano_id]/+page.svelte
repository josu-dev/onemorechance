<script lang="ts">
  import HostMenu from '$cmp/room/HostMenu.svelte';
  import PlayerMenu from '$cmp/room/PlayerMenu.svelte';
  import { room, roomUsers } from '$lib/stores/room.js';
  import { user } from '$lib/stores/user.js';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

  export let data;
</script>

{#if !$room || !$user}
<HostMenu />
  <h1>Room not found</h1>
{:else if data.isHost}
{:else}
  <PlayerMenu />
{/if}

<SuperDebug data={{ room: $room, players: $roomUsers }} />
