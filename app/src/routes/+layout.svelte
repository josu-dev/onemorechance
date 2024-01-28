<script lang="ts">
  import { dev } from '$app/environment';
  import HyperDebug, { debugEnabled } from '$lib/components/HyperDebug.svelte';
  import { defineCommand } from 'svelte-hypercommands';
  import CommandPalette from 'svelte-hypercommands/CommandPalette.svelte';
  import '../app.pcss';
  import AudioPlayer from "$lib/components/AudioPlayer.svelte";
  import { isPlaying } from '$lib/stores/music'; 

  const globalCommands = defineCommand([
    {
      id: 'global:toggle_debug',
      category: 'Global',
      name: 'Toggle Debug',
      description: 'Toggle the global debug panel',
      shortcut: '$mod+D',
      onAction: () => {
        $debugEnabled = !$debugEnabled;
      },
    },
  ]);
</script>

{#if dev}
  <!-- <CommandPalette commands={globalCommands} />
  <HyperDebug /> -->
{/if}
<AudioPlayer/>

<slot />
