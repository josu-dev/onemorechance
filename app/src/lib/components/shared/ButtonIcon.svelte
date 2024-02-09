<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let type: HTMLButtonElement['type'] = 'button';
  export let className = '';
  export let icon: typeof SvelteComponent<{}>;
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let a11yLabel: string = '';

  const iconClass = {
    xs: 'icon-xs',
    sm: 'icon-sm',
    md: 'icon',
    lg: 'icon-lg',
    xl: 'icon-xl',
  };
</script>

<button
  {type}
  on:click
  class="button button-icon {iconClass[size]} {className}"
>
  <span class="sr-only">{a11yLabel}</span>
  <svelte:component this={icon} />
</button>
