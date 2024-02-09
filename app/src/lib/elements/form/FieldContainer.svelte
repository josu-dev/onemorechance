<script lang="ts">
  export let label: string;
  export let errors: string[] | undefined;
</script>

<div class="mt-2">
  <label class="label variant-primary">
    <span>{label}</span>
    <slot />
    {#if errors}
      <p class="text-sm text-red-500">
        {errors}
      </p>
    {/if}
  </label>
</div>
