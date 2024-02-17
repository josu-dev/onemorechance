<script lang="ts" generics="T extends Record<string, unknown>">
  import type { FormPathLeaves, SuperForm } from 'sveltekit-superforms';
  import { formFieldProxy } from 'sveltekit-superforms';

  export let form: SuperForm<T, unknown>;
  export let field: FormPathLeaves<T>;

  const { value } = formFieldProxy(form, field);
</script>

<input
    type="hidden"
    name={field}
    bind:value={$value}
  />
