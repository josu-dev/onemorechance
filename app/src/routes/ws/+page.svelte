<script lang="ts">
  import { sendWebSocketMessage, ws } from '$lib/stores/ws';
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

  const requestData = async () => {
    const res = await fetch('/api/test');
    const data = await res.json();
    console.log('Data from GET endpoint', data);
    logEvent(`[GET] data received: ${JSON.stringify(data)}`);
  };
</script>

<button on:click={() => requestData()}> Request Data from GET endpoint </button>

<button on:click={() => sendWebSocketMessage('test')}> send ws req </button>

<SuperDebug data={ws} />
