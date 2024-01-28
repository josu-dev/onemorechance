<script lang="ts">
  import { debugData } from '$lib/components/HyperDebug.svelte';
  import { room } from '$lib/stores/room.js';
  import { user } from '$lib/stores/user.js';

  export let data;

  debugData.set(room);
</script>

{#if !$room || !$user}
  <p>Cargando</p>
{:else}
  <p>Jugadores {$room.users.length}</p>
{/if}
