<script lang="ts">
  import { goto } from '$app/navigation';
  import Seo from '$comps/layout/Seo.svelte';
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
  const isOwner = !!data.user && data.deck.data.userId === data.user.id;

  const deckDeleteSForm = superForm(data.deck.deleteForm, {
    onSubmit(event) {
      if (!isOwner) {
        event.cancel();
      }
    },
    onUpdated(event) {
      if (!event.form.valid) {
        toast.error(String(event.form.errors.confirm), { duration: 5000 });
        return;
      }

      toast.success('Deck eliminado', { duration: 5000 });
      goto('/decks');
    },
  });

  const deckUpdateSForm = superForm(data.deck.updateForm, {
    resetForm: false,
    onSubmit(event) {
      if (!isOwner) {
        event.cancel();
      }
    },
    onUpdated(event) {
      if (!event.form.valid) {
        toast.error(String(event.form.errors._errors), { duration: 5000 });
        return;
      }

      data.deck.data = event.form.message.deck;
      toast.success('Deck actualizado', { duration: 5000 });
    },
  });
</script>

<Seo
  title="Deck '{data.deck.data.name}' - One More Chance"
  description={isOwner
    ? `Administra tu deck '${data.deck.data.name}' para dejarlo fino como un violín`
    : `Dale un vistazo rapido al deck '${data.deck.data.name}' para ver si vale la pena probarlo`}
/>

<main class="main main-below-header main-with-pb">
  <h1 class="h2 text-white text-center">
    {isOwner ? 'Administrar deck' : 'Deck'} '{data.deck.data.name}'
    <LinkBack href="/decks" className="icon-md" />
  </h1>

  <div
    class="flex flex-1 flex-col items-center gap-4 mt-4 mx-auto w-full max-w-sm sm:max-w-lg lg:max-w-[min(80rem,90%)]"
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
          disabled={!isOwner}
        />
        <FieldTextarea
          form={deckUpdateSForm}
          field="description"
          label="Descripción"
          required
          disabled={!isOwner}
        />

        {#if isOwner}
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
        {/if}
      </form>
    </section>

    <div class="flex flex-col gap-8 w-full">
      <ItemPanel
        type="sentence"
        items={data.sentences.data}
        deleteSV={data.sentences.deleteForm}
        insertSV={data.sentences.insertForm}
        {isOwner}
      />

      {#if optionsEnabled}
        <ItemPanel
          type="option"
          items={data.options.data}
          deleteSV={data.options.deleteForm}
          insertSV={data.options.insertForm}
          {isOwner}
        />
      {/if}
    </div>
  </div>
</main>
