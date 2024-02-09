<script lang="ts">
  import { debugData } from '$comps/HyperDebug.svelte';
  import ButtonIcon from '$comps/shared/ButtonIcon.svelte';
  import { DECK_TYPE } from '$game/enums.js';
  import FieldText from '$lib/elements/form/FieldText.svelte';
  import FieldTextarea from '$lib/elements/form/FieldTextarea.svelte';
  import IconDelete from '$lib/icons/IconDelete.svelte';
  import IconPlus from '$lib/icons/IconPlus.svelte';
  import IconSave from '$lib/icons/IconSave.svelte';
  import IconSpace from '$lib/icons/IconSpace.svelte';
  import IconX from '$lib/icons/IconX.svelte';

  import { superForm } from 'sveltekit-superforms';

  export let data;

  $: debugData.set(data);

  const deckUpdateForm = superForm(data.deck, {
    onUpdated(event) {},
  });

  const seInsertSForm = superForm(data.seInsertForm, {
    dataType: 'json',
  });
  const { form: seInsertForm } = seInsertSForm;
  const seDeleteSForm = superForm(data.seDeleteForm);

  function addSentenceEntry() {
    seInsertSForm.form.update(($form) => {
      $form.sentences.push({
        text: '',
      });
      return $form;
    });
  }

  function removeSentenceEntry(i: number) {
    seInsertSForm.form.update(($form) => {
      $form.sentences.splice(i, 1);
      return $form;
    });
  }

  function insertPlaceHolder(i: number) {
    seInsertSForm.form.update(($form) => {
      const currentText = $form.sentences[i].text;
      $form.sentences[i].text = currentText.trim() + ' {{}}';
      return $form;
    });
  }
</script>

<main class="main">
  <h1 class="h2 text-white text-center">
    Administrar deck '{data.deck.name}'
  </h1>

  <div
    class="flex flex-1 flex-col items-center gap-4 w-full max-w-sm mt-4 sm:max-w-md text-fuchsia-300"
  >
    <section class="w-full">
      <h2 class="h3 text-gray-100">Informacion</h2>
      <form
        action="?/update_deck"
        method="post"
        class="flex flex-col space-y-4 px-1 sm:px-2"
      >
        <FieldText
          form={deckUpdateForm}
          field="name"
          label="Nombre del deck"
          required
        />
        <FieldTextarea
          form={deckUpdateForm}
          field="description"
          label="Descripción"
          required
        />
        <div class="flex justify-end gap-4">
          <form action="?/delete_deck" method="post">
            <ButtonIcon
              icon={IconDelete}
              type="submit"
              a11yLabel="Eliminar deck"
              className="variant-primary"
            />
          </form>
          <ButtonIcon
            icon={IconSave}
            type="submit"
            a11yLabel="Guardar cambios"
            className="variant-primary"
          />
        </div>
      </form>
    </section>

    <div class="w-full flex flex-col md:flex-row">
      <section class="flex-1 flex flex-col gap-2 px-1 rounded">
        <h2 class="h3 text-gray-100">Sentencias</h2>
        <div class="overflow-hidden rounded-md">
          <ul class="divide-y px-1 sm:px-2 max-h-[24rem] overflow-auto">
            {#each data.deckSentences as sentence (sentence.id)}
              <li class="flex text-gray-300 py-2 gap-2">
                <p class="flex-1">{sentence.text}</p>
                <ButtonIcon
                  icon={IconDelete}
                  size="sm"
                  a11yLabel="Eliminar sentencia"
                  className="variant-primary"
                />
              </li>
            {/each}
          </ul>
        </div>

        <div class="mt-4">
          {#if $seInsertForm.sentences.length > 0}
            <h2 class="h3 text-gray-100">Nuevas Sentencias</h2>
          {/if}
          <form
            action="?/sentences_add"
            method="post"
            use:seInsertSForm.enhance
            class="flex flex-col gap-4"
          >
            <input type="hidden" name="deckId" value={$seInsertForm.deckId} />
            {#each $seInsertForm.sentences as _, i}
              <div class="relative">
                <FieldText
                  form={seInsertSForm}
                  field="sentences[{i}].text"
                  label="Sentencia {i + 1}"
                />
                <div class="absolute bottom-[50%] right-0 flex gap-2">
                  <ButtonIcon
                    icon={IconSpace}
                    on:click={() => insertPlaceHolder(i)}
                    size="sm"
                    className="variant-primary"
                  />
                  <ButtonIcon
                    icon={IconX}
                    on:click={() => removeSentenceEntry(i)}
                    size="sm"
                    className="variant-primary"
                  />
                </div>
              </div>
            {/each}
            <div class="flex justify-center gap-8">
              <ButtonIcon
                icon={IconPlus}
                on:click={addSentenceEntry}
                className="button variant-primary p-1 w-max"
              />
              {#if $seInsertForm.sentences.length > 0}
                <ButtonIcon
                  icon={IconSave}
                  type="submit"
                  className="button variant-primary p-1 w-max"
                />
              {/if}
            </div>
          </form>
        </div>
      </section>

      {#if data.deck.type === DECK_TYPE.CHOOSE}
        <section class="flex flex-col gap-2 px-1 rounded">
          <h2 class="h3 text-gray-100">Sentencias</h2>
        </section>
      {/if}
    </div>
  </div>
</main>
