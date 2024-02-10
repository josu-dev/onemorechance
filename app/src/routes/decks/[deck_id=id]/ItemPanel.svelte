<script lang="ts">
  import ButtonIcon from '$comps/shared/ButtonIcon.svelte';
  import FieldTextarea from '$lib/elements/form/FieldTextarea.svelte';
  import IconDelete from '$lib/icons/IconDelete.svelte';
  import IconPlus from '$lib/icons/IconPlus.svelte';
  import IconSave from '$lib/icons/IconSave.svelte';
  import IconSpace from '$lib/icons/IconSpace.svelte';
  import IconX from '$lib/icons/IconX.svelte';
  import { nanoid } from 'nanoid';
  import { tick } from 'svelte';
  import { superForm, type SuperValidated } from 'sveltekit-superforms';

  type ItemInsert = {
    text: string;
  };

  type ItemData = {
    id: string;
    text: string;
    createdAt: number;
  };

  type Item = {
    id: string;
    text: string;
    createdAt: number;
    toDelete: boolean;
  };

  export let type: 'sentence' | 'option';
  export let items: ItemData[];
  export let deleteSV: SuperValidated<{ ids: string[] }>;
  export let insertSV: SuperValidated<{
    deckId: string;
    items: ItemInsert[];
  }>;

  const isSentence = type === 'sentence';
  const title = isSentence ? 'Sentencias' : 'Opciones';
  const actionDelete = isSentence ? '?/sentences_delete' : '?/options_delete';
  const actionInsert = isSentence ? '?/sentences_insert' : '?/options_insert';
  const insertFormId = nanoid();

  let _items: Item[] = [];
  for (const item of items) {
    _items.push({
      id: item.id,
      text: item.text,
      createdAt: item.createdAt,
      toDelete: false,
    });
  }

  $: totalItems = _items.length;

  let toDeleteCount = 0;

  const deleteSForm = superForm(deleteSV, {
    dataType: 'json',
    onUpdated(event) {
      toDeleteCount = 0;
      for (let i = 0; i < _items.length; i++) {
        for (const deleted of event.form.message.deleted) {
          if (_items[i].id === deleted.id) {
            _items.splice(i, 1);
            i--;
            break;
          }
        }
      }
      _items = _items;
    },
  });

  function toggleItemToDelete(item: Item) {
    toDeleteCount += item.toDelete ? 1 : -1;
    deleteSForm.form.update(($form) => {
      $form.ids.push(item.id);
      return $form;
    });
  }

  let toInsertInputs: FieldTextarea<any>[] = [];

  const insertSForm = superForm(insertSV, {
    dataType: 'json',
    onUpdated(event) {
      for (const item of event.form.message.inserted) {
        _items.push({
          id: item.id,
          text: item.text,
          createdAt: item.createdAt,
          toDelete: false,
        });
      }
      _items = _items;
    },
  });
  const { form: seInsertForm } = insertSForm;

  function addEntry() {
    insertSForm.form.update(($form) => {
      $form.items.push({
        text: '',
      });
      return $form;
    });
  }

  function removeEntry(i: number) {
    insertSForm.form.update(($form) => {
      $form.items.splice(i, 1);
      return $form;
    });
  }

  function addPlaceHolder(i: number) {
    insertSForm.form.update(($form) => {
      const currentText = $form.items[i].text;
      $form.items[i].text = currentText.trim() + ' {{}}';
      return $form;
    });
  }
</script>

<section class="flex-1 flex flex-col gap-2 px-1 w-full">
  <div class="flex flex-col gap-4 lg:flex-row lg:gap-8">
    <div class="flex-1">
      <div class="flex justify-between">
        <h2 class="h3 text-gray-100">
          {title} <span class="text-gray-300 font-normal">({totalItems})</span>
        </h2>
        {#if toDeleteCount > 0}
          <form
            action={actionDelete}
            method="post"
            use:deleteSForm.enhance
            class="self-center"
          >
            <ButtonIcon
              icon={IconDelete}
              type="submit"
              label="Eliminar {isSentence ? 'sentencias' : 'opciones'} marcadas"
              className="variant-primary"
            />
          </form>
        {/if}
      </div>
      <ul class="divide-y px-1 sm:px-2 max-h-[24rem] overflow-auto">
        {#each _items as item (item.id)}
          <li class="flex text-gray-300 py-2 px-2 gap-2">
            <p class="flex-1">{item.text}</p>
            <ButtonIcon
              icon={IconX}
              size="sm"
              label="Marcar para eliminar"
              className="variant-primary {item.toDelete ? '!bg-red-700' : ''}"
              on:click={() => {
                item.toDelete = !item.toDelete;
                toggleItemToDelete(item);
              }}
            />
          </li>
        {/each}
      </ul>
    </div>

    <div class="flex-1">
      <h2 class="h3 text-gray-100">
        Nuevas {isSentence ? 'sentencias' : 'opciones'}
      </h2>
      <form
        action={actionInsert}
        method="post"
        use:insertSForm.enhance
        id={insertFormId}
        class="flex flex-col gap-2 max-h-[24rem] p-1 overflow-y-auto"
      >
        {#each $seInsertForm.items as _, i}
          <div class="relative">
            <FieldTextarea
              form={insertSForm}
              field="items[{i}].text"
              label="{isSentence ? 'Sentencia' : 'Opcion'} {totalItems + i + 1}"
              rows={2}
              bind:this={toInsertInputs[i]}
            />
            <div class="absolute top-4 right-1 flex gap-2">
              {#if isSentence}
                <ButtonIcon
                  icon={IconSpace}
                  on:click={() => {
                    addPlaceHolder(i);
                    tick().then(toInsertInputs[i]?.focus);
                  }}
                  size="sm"
                  label="Insertar marcador para respuesta"
                  className="variant-primary"
                />
              {/if}
              <ButtonIcon
                icon={IconX}
                on:click={() => removeEntry(i)}
                size="sm"
                label="Eliminar sentencia"
                className="variant-primary"
              />
            </div>
          </div>
        {/each}
      </form>
      <div class="flex justify-center gap-8 mt-4">
        <ButtonIcon
          icon={IconPlus}
          on:click={(e) => {
            addEntry();
            // @ts-ignore
            const rect = e.target?.getBoundingClientRect();
            const offset = 16; // 16px
            tick().then(() => {
              const main = document.querySelector('main');
              if (main) {
                main.scrollTo({
                  top: rect.top + main.scrollHeight - offset,
                  behavior: 'instant',
                });
              }
            });
          }}
          label="Agregar sentencia"
          className="button variant-primary p-1 w-max"
        />
        {#if $seInsertForm.items.length > 0}
          <ButtonIcon
            icon={IconSave}
            type="submit"
            form={insertFormId}
            label="Guardar sentencias"
            className="button variant-primary p-1 w-max"
          />
        {/if}
      </div>
    </div>
  </div>
</section>
