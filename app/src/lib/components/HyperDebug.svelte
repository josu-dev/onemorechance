<script lang="ts" context="module">
  import { writable } from 'svelte/store';

  export const debugData = writable();
  export const debugEnabled = writable(false);
</script>

<script lang="ts">
  import { useClickOutside } from '$lib/actions/index.js';
  import SuperDebug from 'sveltekit-superforms';

  export let label: string | undefined = undefined;
  export let stringTruncate: number | undefined = undefined;
  export let functions = true;
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
      use:useClickOutside={{ handler: () => debugEnabled.set(false) }}
      class="fixed inset-0 my-auto mx-auto h-max max-h-[90vh] max-w-[95vw] sm:max-w-[min(90vw,1024px)] overflow-y-auto"
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
