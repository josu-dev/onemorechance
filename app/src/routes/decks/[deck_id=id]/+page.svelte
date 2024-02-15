<script lang="ts">
  import { goto } from '$app/navigation';
  import ButtonIcon from '$comps/shared/ButtonIcon.svelte';
  import LinkBack from '$comps/shared/LinkBack.svelte';
  import FieldHidden from '$lib/elements/form/FieldHidden.svelte';
  import FieldText from '$lib/elements/form/FieldText.svelte';
  import FieldTextarea from '$lib/elements/form/FieldTextarea.svelte';
  import IconDelete from '$lib/icons/IconDelete.svelte';
  import IconSave from '$lib/icons/IconSave.svelte';
  import { DECK_TYPE } from '$shared/constants.js';
  import toast from 'svelte-french-toast';
  import { superForm } from 'sveltekit-superforms';
  import ItemPanel from './ItemPanel.svelte';

  export let data;

  const optionsEnabled = data.deck.data.type === DECK_TYPE.SELECT;

  const deckUpdateSForm = superForm(data.deck.updateForm, {
    resetForm: false,
    onUpdated(event) {
      data.deck.data = event.form.message.updated;
      toast.success('Deck actualizado', { duration: 5000 });
    },
  });

  const deckDeleteSForm = superForm(data.deck.deleteForm, {
    onUpdated(event) {
      if (!event.form.valid) {
        toast.error(String(event.form.errors.confirm), { duration: 5000 });
        return;
      }

      toast.success('Deck eliminado', { duration: 5000 });
      goto('/decks');
    },
  });
</script>

<main class="main main-p-header">
  <h1 class="h2 text-white text-center">
    Administrar deck '{data.deck.data.name}'
    <LinkBack href="/decks" className="icon-md" />
  </h1>

  <div
    class="flex flex-1 flex-col items-center gap-4 mt-4 w-full max-w-sm sm:max-w-lg lg:max-w-[min(80rem,90%)]"
  >
    <section class="max-w-lg w-full">
      <h2 class="h3 text-gray-100">Informacion</h2>
      <form
        action="?/deck_update"
        method="post"
        use:deckUpdateSForm.enhance
        class="flex flex-col space-y-4 px-1 sm:px-2"
      >
        <FieldText
          form={deckUpdateSForm}
          field="name"
          label="Nombre del deck"
          required
        />
        <FieldTextarea
          form={deckUpdateSForm}
          field="description"
          label="Descripción"
          required
        />

        <div class="flex justify-end gap-4">
          <form
            action="?/deck_delete"
            method="post"
            use:deckDeleteSForm.enhance
          >
            <FieldHidden form={deckDeleteSForm} field="id" />
            <ButtonIcon
              icon={IconDelete}
              type="submit"
              label="Eliminar deck"
              className="variant-primary"
            />
          </form>
          <ButtonIcon
            icon={IconSave}
            type="submit"
            label="Guardar cambios"
            className="variant-primary"
          />
        </div>
      </form>
    </section>

    <div class="flex flex-col gap-8 w-full">
      <ItemPanel
        type="sentence"
        items={data.sentences.data}
        deleteSV={data.sentences.deleteForm}
        insertSV={data.sentences.insertForm}
      />

      {#if optionsEnabled}
        <ItemPanel
          type="option"
          items={data.options.data}
          deleteSV={data.options.deleteForm}
          insertSV={data.options.insertForm}
        />
      {/if}
    </div>
  </div>
</main>
