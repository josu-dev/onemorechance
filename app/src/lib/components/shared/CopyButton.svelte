<script lang="ts">
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

<button on:click={onClick} class="relative {className}">
  {#if tooltip}
    <div transition:scale class="absolute -top-8 left-1/2 -translate-x-1/2">
      <div class="card p-1 variant-filled-primary relative">
        <p class="text-sm">{tooltipText}</p>
        <div
          class="arrow variant-filled-primary absolute rotate-45 w-2 h-2 -bottom-1 left-1/2 -translate-x-1/2"
        />
      </div>
    </div>
  {/if}
  <span class="sr-only">{a11yLabel}</span>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="lucide lucide-copy h-full w-full"
    ><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path
      d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"
    /></svg
  >
</button>
