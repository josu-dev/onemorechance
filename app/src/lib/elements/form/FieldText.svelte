<script lang="ts" generics="T extends Record<string, unknown>">
  import type { FormPathLeaves, SuperForm } from 'sveltekit-superforms';
  import { formFieldProxy } from 'sveltekit-superforms';
  import FieldContainer from './FieldContainer.svelte';

  export let form: SuperForm<T, unknown>;
  export let field: FormPathLeaves<T>;

  export let label: string;
  export let autocomplete = 'off';
  export let disabled = false;

  const { value, errors, constraints } = formFieldProxy(form, field);
</script>

<FieldContainer {label} errors={$errors}>
  <input
    type="text"
    {autocomplete}
    {disabled}
    name={field}
    aria-invalid={$errors ? 'true' : undefined}
    bind:value={$value}
    {...$constraints}
    {...$$restProps}
    class="input variant-primary w-full"
  />
</FieldContainer>
