<script lang="ts">
  import Seo from '$comps/layout/Seo.svelte';
  import LinkBack from '$comps/shared/LinkBack.svelte';
  import FieldFile from '$lib/elements/form/FieldFile.svelte';
  import IconDownload from '$lib/icons/IconDownload.svelte';
  import { slugify } from '$lib/utils/index.ts';
  import { t } from '$lib/utils/translate_constants.js';
  import { DECK_TYPE } from '$shared/constants.js';
  import toast from 'svelte-french-toast';
  import { superForm } from 'sveltekit-superforms';

  export let data;

  $: decksToShow = [...data.decks];

  const deckTypeClass = {
    [DECK_TYPE.SELECT]: 'badge-secondary',
    [DECK_TYPE.COMPLETE]: 'badge-tertiary',
  };

  let deckUploadMode = false;

  const deckUploadSForm = superForm(data.deckUploadForm, {
    onError(event) {
      toast.error(event.result.error.message, { duration: 5000 });
    },
    onUpdated(event) {
      if (!event.form.valid) {
        toast.error(String(event.form.errors._errors), { duration: 5000 });
        return;
      }

      toast.success('Deck subido', { duration: 2500 });
    },
  });
</script>

<Seo
  title="Dashboard - One More Chance"
  description="Dashboard de desarrollador de One More Chance"
/>

<main class="main main-below-header main-with-pb">
  <h1 class="h2 text-white text-center">
    Dashboard
    <LinkBack href="/" className="icon-md" />
  </h1>

  <button
    on:click={() => (deckUploadMode = !deckUploadMode)}
    class="button variant-primary w-auto mx-auto"
  >
    {deckUploadMode ? 'Ver decks cargados' : 'Subir un nuevo deck'}
  </button>

  <div class="flex-1 grid overflow-hidden mt-4">
    {#if deckUploadMode}
      <section
        class="z-0 grid grid-rows-[auto_1fr] h-full w-full max-w-screen-sm overflow-y-auto mx-auto px-4"
      >
        <h2 class="h3 text-gray-100 text-center">Subir un nuevo deck</h2>

        <form
          action="?/deck_upload"
          method="post"
          enctype="multipart/form-data"
          use:deckUploadSForm.enhance
          class="flex flex-col gap-4 justify-center h-min w-full py-4 md:gap-6"
        >
          <FieldFile
            form={deckUploadSForm}
            field="file"
            label="Archivo"
            accept=".json"
            required
          />
          <div class="flex justify-center">
            <button type="submit" class="button variant-primary">Subir</button>
          </div>
        </form>
      </section>
    {:else}
      <section
        class="z-0 grid grid-rows-[auto_1fr] h-full w-full max-w-screen-xl overflow-y-auto mx-auto px-4"
      >
        <h2
          class="sticky top-0 z-10 h3 text-gray-100 text-center backdrop-blur-[2px]"
        >
          Decks cargados
        </h2>
        <ul
          class="flex flex-wrap gap-4 justify-center h-min w-full py-4 md:gap-6"
        >
          {#each decksToShow as deck}
            <li class="w-full max-w-96 h-40">
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
                <div class="flex justify-between mt-auto pt-1">
                  <span class="badge {deckTypeClass[deck.type]} my-auto"
                    >{t.deckType(deck.type)}</span
                  >
                  <a
                    href="/api/v1/decks/{deck.id}/download?pretty=true"
                    rel="noopener noreferrer"
                    target="_blank"
                    download="{slugify(deck.name, '_')}.json"
                    title="Descargar deck {deck.name} en formato JSON"
                    class="button variant-primary square-6 p-px button-icon"
                  >
                    <span class="sr-only"
                      >Descargar deck {deck.name} en formato JSON</span
                    >
                    <IconDownload /></a
                  >
                </div>
              </a>
            </li>
          {/each}
        </ul>
      </section>
    {/if}
  </div>
</main>
