<script lang="ts">
  export let className = '';
  export let errors: string[] | undefined;
  export let label: string;
  export let labelHidden = false;
</script>

<div class="mt-2 {className}">
  <label class="label variant-primary">
    <span class:sr-only={labelHidden}>{label}</span>
    <slot />
    {#if errors}
      <p class="mt-2 text-sm text-red-500 text-pretty">
        {errors}
      </p>
    {/if}
  </label>
</div>
