<script lang="ts">
  import IconCopy from '$lib/icons/IconCopy.svelte';
  import { scale } from 'svelte/transition';

  export let a11yLabel = 'Copiar';

  export let copy: string;

  export let tooltipText = 'Copiado!';

  export let tooltipTimeout = 2500;

  export let className = '';

  type CopyEvent = MouseEvent & {
    currentTarget: EventTarget & HTMLButtonElement;
  };

  let tooltip = false;

  let timeoutId: ReturnType<typeof setTimeout>;

  function onClick(event: CopyEvent) {
    navigator.clipboard.writeText(copy).then(
      () => {
        tooltip = true;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          tooltip = false;
        }, tooltipTimeout);
      },
      () => {
        tooltip = false;
      },
    );
  }
</script>

<button on:click={onClick} class="relative [&>svg]:w-full [&>svg]:h-full {className}" title={a11yLabel}>
  {#if tooltip}
    <div transition:scale class="absolute -top-8 left-1/2 -translate-x-1/2">
      <div
        class="card p-[5px] pb-px bg-black shadow-sm shadow-white/25 relative"
        style="--tw-shadow-colored: 0 0 4px 0 var(--tw-shadow-color);"
      >
        <p class="text-sm">{tooltipText}</p>
        <div
          class="bg-black shadow-sm shadow-white/25 absolute rotate-45 square-2 -bottom-1 left-1/2 -translate-x-1/2 -z-10"
        />
      </div>
    </div>
  {/if}
  <span class="sr-only">{a11yLabel}</span>
  <IconCopy />
</button>
