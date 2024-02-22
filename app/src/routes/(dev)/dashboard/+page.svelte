<script lang="ts">
  import Seo from '$comps/layout/Seo.svelte';
  import LinkBack from '$comps/shared/LinkBack.svelte';
  import IconDownload from '$lib/icons/IconDownload.svelte';
  import { slugify } from '$lib/utils/index.ts';
  import { t } from '$lib/utils/translate_constants.js';
  import { DECK_TYPE } from '$shared/constants.js';

  export let data;

  $: decksToShow = [...data.decks];

  const deckTypeClass = {
    [DECK_TYPE.SELECT]: 'badge-secondary',
    [DECK_TYPE.COMPLETE]: 'badge-tertiary',
  };
</script>

<Seo
  title="Decks - One More Chance"
  description="Crea un nuevo deck o elige uno ya creado para cagarte de risa con tus amigos"
/>

<main class="main main-below-header main-with-pb">
  <h1 class="h2 text-white text-center">
    Dashboard
    <LinkBack href="/" className="icon-md" />
  </h1>

  <div class="flex-1 grid overflow-hidden mt-4">
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
  </div>
</main>
