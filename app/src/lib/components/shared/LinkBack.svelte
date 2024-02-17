<script lang="ts">
  import IconUndo from '$lib/icons/IconUndo.svelte';

  export let href: string;
  export let className = '';
  export let label = 'Volver atras';
</script>

<a
  {href}
  class="button-icon inline-block hover:scale-105 transition-transform {className}"
  title={label}><span class="sr-only">{label}</span><IconUndo /></a
>
