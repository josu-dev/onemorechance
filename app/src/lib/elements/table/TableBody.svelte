<script lang="ts" generics="T extends Record<string, unknown>">
  export let rows: T[];
  export let className = '';
</script>

<tbody
  class="divide-y divide-gray-700 bg-gray-950/25 [&>tr:hover]:bg-gray-950 {className}"
>
  {#each rows as row, i (row)}
    <slot {i} {row} />
  {/each}
</tbody>
