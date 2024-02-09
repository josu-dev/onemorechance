<script lang="ts">
  import { goto } from '$app/navigation';
  import { debugData } from '$comps/HyperDebug.svelte';
  import FieldSelect from '$lib/elements/form/FieldSelect.svelte';
  import FieldText from '$lib/elements/form/FieldText.svelte';
  import FieldTextarea from '$lib/elements/form/FieldTextarea.svelte';
  import { DECK_TYPE_CREATE } from '$lib/schemas/deck.js';
  import { superForm } from 'sveltekit-superforms/client';

  export let data;

  const createSForm = superForm(data.createForm, {
    onUpdated({ form }) {
      goto(`/decks/${form.message.deck.id}`);
    },
  });

  debugData.set(createSForm.form);
</script>

<main class="main">
  <h1 class="h2 text-white text-center">Crear nuevo deck</h1>

  <div
    class="flex flex-1 flex-col items-center gap-4 w-full max-w-sm mt-4 sm:max-w-md text-fuchsia-300"
  >
    <form
      method="POST"
      action="?/new"
      use:createSForm.enhance
      class="flex flex-col gap-4 md:gap-8 w-full"
    >
      <div class="flex flex-col gap-2">
        <FieldSelect
          form={createSForm}
          field="type"
          label="Tipo"
          options={[
            { text: 'Sin seleccionar', value: DECK_TYPE_CREATE.UNSET },
            { text: 'Eleccion', value: DECK_TYPE_CREATE.CHOOSE },
            { text: 'Completar', value: DECK_TYPE_CREATE.COMPLETE },
          ]}
        />
        <FieldText form={createSForm} field="name" label="Nombre" />
        <FieldTextarea
          form={createSForm}
          field="description"
          label="Descripcion"
        />
      </div>
      <button type="submit" class="button variant-primary"> Crear </button>
    </form>
  </div>
</main>
