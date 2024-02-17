<script lang="ts">
  import type { SvelteComponent } from 'svelte';

  type Col = {
    label: string;
    class: string;
    enabled?: boolean;
    icon?: typeof SvelteComponent<{}>;
    onClick?: () => void;
  };

  export let cols: Col[];
  export let className = '';
</script>

<thead
  class="sticky top-0 text-sm text-gray-100 uppercase bg-black w-full {className}"
  style="box-shadow: 0px 1px 0px 0px rgb(229 231 235);"
  {...$$restProps}
>
  <tr class="">
    {#each cols as col, i}
      <th scope="col" class="px-3 py-2 font-medium {col.class}">
        <span class="sr-only">{col.label}</span>

        {#if col.icon}
          <div class="mx-auto w-max" title={col.label}>
            <svelte:component this={col.icon} />
          </div>
        {/if}
      </th>
    {/each}
  </tr>
</thead>
