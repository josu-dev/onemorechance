<script lang="ts">
  import { goto } from '$app/navigation';
  import Seo from '$comps/layout/Seo.svelte';
  import LinkBack from '$comps/shared/LinkBack.svelte';
  import FieldSelect from '$lib/elements/form/FieldSelect.svelte';
  import FieldText from '$lib/elements/form/FieldText.svelte';
  import FieldTextarea from '$lib/elements/form/FieldTextarea.svelte';
  import { DECK_TYPE_CREATE } from '$lib/schemas/deck.js';
  import { t } from '$lib/utils/translate_constants.js';
  import { DECK_TYPE } from '$shared/constants.js';
  import { superForm } from 'sveltekit-superforms';

  export let data;

  const createSForm = superForm(data.createForm, {
    invalidateAll: false,
    resetForm: false,
    onUpdated({ form }) {
      if (!form.valid) {
        return;
      }

      goto(`/decks/${form.message.deck.id}`);
    },
  });

  const deckTypeClass = {
    [DECK_TYPE.SELECT]: 'badge-secondary',
    [DECK_TYPE.COMPLETE]: 'badge-tertiary',
  };
</script>

<Seo
  title="Decks - One More Chance"
  description="Crea un nuevo deck o elige uno ya creado para cagarte de risa con tus amigos"
/>

<main class="main main-p-header">
  <h1 class="h2 text-white text-center">
    Decks de la comunidad
    <LinkBack href="/" className="icon-md" />
  </h1>

  <div
    class="container flex flex-1 flex-col items-center gap-4 w-full mt-4 md:flex-row-reverse lg:gap-8 md:items-start md:justify-center"
  >
    <section class="px-2 md:px-4 w-full max-w-sm">
      <h2 class="h3 text-gray-100 text-center">Nuevo deck</h2>
      <form
        action="?/create"
        method="post"
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
              { text: 'Eleccion', value: DECK_TYPE_CREATE.SELECT },
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

        <div class="flex justify-center">
          <button type="submit" class="button variant-primary">Crear</button>
        </div>
      </form>
    </section>

    <section class="w-full max-w-4xl">
      <h2 class="h3 text-gray-100 text-center">Decks disponibles</h2>
      <ul
        class="flex flex-wrap gap-4 justify-around py-4 md:px-4 lg:px-0 md:max-h-[40rem] md:overflow-y-auto"
      >
        {#each data.decks as deck}
          <li class="w-full max-w-96">
            <a
              href="/decks/{deck.id}"
              class="card variant-hover variant-primary h-full"
            >
              <p class="text-gray-100">
                {deck.name}
              </p>
              <p class="line-clamp-2 text-ellipsis">
                {deck.description}
              </p>
              <div class="flex mt-auto pt-1">
                <span class="badge {deckTypeClass[deck.type]}"
                  >{t.deckType(deck.type)}</span
                >
              </div>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  </div>
</main>
