<script lang="ts" generics="T extends Record<string, unknown>">
  import type { FormPathLeaves, SuperForm } from 'sveltekit-superforms';
  import { formFieldProxy } from 'sveltekit-superforms';
  import FieldContainer from './FieldContainer.svelte';

  export let form: SuperForm<T, unknown>;
  export let field: FormPathLeaves<T>;

  export let label: string;
  export let autocomplete = 'off';
  export let disabled = false;

  export let resize : 'none' | 'both' | 'horizontal' | 'vertical' = 'none';
  export let rows = 3;
  export let spellcheck = true;
  
  const resizeClass = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y',
  };

  const { value, errors, constraints } = formFieldProxy(form, field);
</script>

<FieldContainer {label} errors={$errors}>
  <textarea
    {autocomplete}
    {disabled}
    {spellcheck}
    {rows}
    name={field}
    aria-invalid={$errors ? 'true' : undefined}
    bind:value={$value}
    {...$constraints}
    {...$$restProps}
    class="input variant-primary w-full {resizeClass[resize]}"
  ></textarea>
</FieldContainer>
