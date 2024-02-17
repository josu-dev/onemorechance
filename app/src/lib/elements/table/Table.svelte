<script lang="ts">
  export let className = '';
</script>

<div class="w-full overflow-x-auto rounded-md shadow-lg ring-1 ring-gray-300 {className}">
  <table {...$$restProps} class="w-full bg-black text-gray-300">
    <slot />
  </table>
</div>
