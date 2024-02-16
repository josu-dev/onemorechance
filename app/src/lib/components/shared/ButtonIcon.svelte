<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  export let type: HTMLButtonElement['type'] = 'button';
  export let className = '';
  export let icon: typeof SvelteComponent<{}>;
  export let size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';
  export let label = '';
  export let form: string | undefined = undefined;
  export let disabled = false;

  const iconClass = {
    xs: 'icon-xs',
    sm: 'icon-sm',
    md: 'icon-md',
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
  {disabled}
>
  <span class="sr-only">{label}</span>
  <svelte:component this={icon} />
</button>
