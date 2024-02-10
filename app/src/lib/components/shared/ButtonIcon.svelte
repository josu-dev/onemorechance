<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let type: HTMLButtonElement['type'] = 'button';
  export let className = '';
  export let icon: typeof SvelteComponent<{}>;
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let label = '';
  export let form: string | undefined = undefined;

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
  title={label}
  {form}
>
  <span class="sr-only">{label}</span>
  <svelte:component this={icon} />
</button>
