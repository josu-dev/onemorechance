<script lang="ts" generics="T extends Record<string, unknown>">
  import type { FormPathLeaves, SuperForm } from 'sveltekit-superforms';
  import { formFieldProxy } from 'sveltekit-superforms';
  import FieldContainer from './FieldContainer.svelte';

  export let form: SuperForm<T, unknown>;
  export let field: FormPathLeaves<T>;

  export let disabled = false;
  export let label: string;
  export let required = false;

  export let accept = '';
  export let capture = false;
  export let multiple = false;

  let input: HTMLInputElement | undefined;

  export function focus() {
    input?.focus();
  }

  const { value, errors, constraints } = formFieldProxy(form, field);

  function onInput(e: Event & { currentTarget: EventTarget & typeof input }) {
    $value = (
      multiple
        ? Array.from(e.currentTarget.files ?? [])
        : e.currentTarget.files?.item(0)
    ) as any;
  }
</script>

<FieldContainer {label} errors={$errors}>
  <input
    type="file"
    autocomplete="off"
    {disabled}
    name={field}
    aria-invalid={$errors ? 'true' : undefined}
    bind:this={input}
    on:input={onInput}
    {...$constraints}
    {...$$restProps}
    {accept}
    {capture}
    {required}
    {multiple}
    class="input variant-primary w-full"
  />
</FieldContainer>
