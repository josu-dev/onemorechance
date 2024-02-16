<script lang="ts">
  import { dev } from '$app/environment';
  import Header from '$comps/layout/Header.svelte';
  import HyperDebug, { debugEnabled } from '$lib/components/HyperDebug.svelte';
  import { user } from '$lib/stores/user.js';
  import { Toaster } from 'svelte-french-toast';
  import { defineCommand, definePage } from 'svelte-hypercommands';
  import CommandPalette from 'svelte-hypercommands/CommandPalette.svelte';
  import '../app.pcss';

  export let data;

  if (data.user) {
    user.mset(data.user);
  }

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
    {
      id: 'global:toggle_elements_rings',
      category: 'Global',
      name: 'Toggle Elements Rings',
      description: 'Toggle the rings for any element on hover',
      shortcut: '$mod+R',
      onAction: () => {
        let style = document.getElementById('DEV:elements-rings');
        if (style) {
          style.parentNode?.removeChild(style);
          return;
        }

        style = document.createElement('style');
        style.id = 'DEV:elements-rings';
        style.innerHTML = `body *:hover {
          --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
          --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
          box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
          --tw-ring-opacity: 1;
          --tw-ring-color: rgb(240 171 252 / var(--tw-ring-opacity));
        }\n`;
        document.head.appendChild(style);
      },
    },
  ]);

  const globalPages = definePage([
    {
      name: 'Decks',
      url: '/decks',
      description: 'List of all decks',
    },
    {
      name: 'Ranking',
      url: '/ranking',
      description: 'List of all decks',
    },
    {
      name: 'Stages',
      url: '/game/stages',
      description: 'Debug the game stages',
    },
    {
      name: 'Home',
      url: '/',
      description: 'Root of the app',
    },
    {
      name: 'UI Test',
      url: '/ui',
      description: 'Test the UI components',
    },
  ]);
</script>

{#if dev}
  <CommandPalette commands={globalCommands} pages={globalPages} />
  <HyperDebug />
{/if}

<Toaster
  position="bottom-left"
  containerClassName="omc-toast-container"
  toastOptions={{ className: 'omc-toast' }}
/>

<Header />

<div class="h-full max-h-full [&:has(>.main-p-header)]:pt-12">
  <slot />
</div>
