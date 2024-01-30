<script lang="ts">
  import { dev } from '$app/environment';
  import AudioPlayer from '$lib/components/AudioPlayer.svelte';
  import HyperDebug, { debugEnabled } from '$lib/components/HyperDebug.svelte';
  import { defineCommand } from 'svelte-hypercommands';
  import CommandPalette from 'svelte-hypercommands/CommandPalette.svelte';
  import '../app.pcss';import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';

  import { storePopup } from '@skeletonlabs/skeleton';
storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
			
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
  <CommandPalette commands={globalCommands} />
  <HyperDebug />
{/if}

<AudioPlayer />

<slot />
