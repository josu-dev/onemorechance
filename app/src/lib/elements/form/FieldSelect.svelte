<script lang="ts" generics="T extends Record<string, unknown>">
  import type { FormPathLeaves, SuperForm } from 'sveltekit-superforms';
  import { formFieldProxy } from 'sveltekit-superforms';
  import FieldContainer from './FieldContainer.svelte';

  export let form: SuperForm<T, unknown>;
  export let field: FormPathLeaves<T>;

  export let label: string;
  export let disabled = false;
  export let autocomplete = 'off';

  type Option = { text: string; value: string; selected?: boolean };
  export let options: Option[];
  export let selected: string | undefined = undefined;

  const { value, errors, constraints } = formFieldProxy(form, field);
</script>

<FieldContainer {label} errors={$errors}>
  <select
    {autocomplete}
    {disabled}
    name={field}
    aria-invalid={$errors ? 'true' : undefined}
    bind:value={$value}
    {...$constraints}
    {...$$restProps}
    class="input variant-primary w-full"
  >
    {#each options as option}
      {@const s = option.selected ?? option.value === selected}
      <option value={option.value} selected={s}>{option.text}</option>
    {/each}
  </select>
</FieldContainer>
