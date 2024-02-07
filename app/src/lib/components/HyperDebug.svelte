<script lang="ts" context="module">
  import { writable } from 'svelte/store';

  export const debugData = writable(undefined as unknown);
  export const debugEnabled = writable(false);
</script>

<script lang="ts">
  import SuperDebug from 'sveltekit-superforms/client/SuperDebug.svelte';

  export let label: string | undefined = undefined;
  export let stringTruncate: number | undefined = undefined;
  export let functions = false;
</script>

<div class="fixed bottom-0 right-0 z-10">
  <button
    class="block p-1 pb-0 text-sm leading-tight font-medium text-white bg-red-700"
    on:click={() => ($debugEnabled = !$debugEnabled)}
  >
    DB
  </button>
  {#if $debugEnabled}
    <div
      class=" fixed top-0 right-0 bottom-0 left-0 container p-4 mx-auto overflow-y-auto"
    >
      <SuperDebug
        data={$debugData}
        {label}
        {stringTruncate}
        {functions}
        theme="vscode"
      />
    </div>
  {/if}
</div>

<style lang="postcss">
  div :global(:is(pre, span)) {
    font-family: 'JetBrains Mono', Inconsolata, Monaco, Consolas,
      'Lucida Console', 'Courier New', Courier, monospace;
  }
</style>
