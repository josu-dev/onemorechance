<script lang="ts">
  import { browser } from '$app/environment';
  import { page } from '$app/stores';
  import Seo from '$comps/layout/Seo.svelte';
  import { PROJECT_REPOSITORY } from '$lib/defaults.ts';
  import { log } from '$lib/utils/clientside.ts';

  $: is404 = $page.status === 404;
  $: is500s = $page.status === 500;

  $: title = `${$page.status} - One More Chance`;
  $: titleOG =
    (is404 && 'Pagina no encontrada') ||
    (is500s && 'Error en el servidor') ||
    'Error en la solicitud';
  $: description =
    (is404 &&
      `Buscabas la pagina ${$page.url.pathname}?, parece que su existencia es otro chiste de mal gusto`) ||
    (is500s &&
      `El nivel de los chistes es tan alto que rompimos el servidor`) ||
    `Algo salio mal con la solicitud a ${$page.url.pathname}, pero no te preocupes nada se rompio o al menos pensemos eso`;

  $: subtitle =
    $page.error?.friendly ??
    ((is404 && 'Pagina no encontrada') ||
      (is500s && 'Error en el servidor') ||
      'Creo que hiciste algo mal');

  $: safePathname =
    $page.url.pathname.length >= 64
      ? $page.url.pathname.slice(0, 61) + '...'
      : $page.url.pathname;

  $: if (browser && !$page.error?.friendly) {
    log.error(`sk error: ${JSON.stringify($page.error, null, 2)}`);
  }
</script>

<Seo {title} {description} {titleOG} />

<main class="main main-below-header main-with-pb relative">
  <div
    class="h-full w-full grid grid-rows-6 max-w-md my-auto mx-auto lg:max-w-screen-md"
  >
    <div
      class="row-start-2 row-span-4 grid grid-rows-3 lg:row-start-2 lg:row-span-3 lg:grid-rows-1 lg:grid-cols-2 lg:items-center"
    >
      <div
        class="justify-self-center self-end lg:row-span-2 lg:self-center lg:scale-110"
      >
        <img src="/logo/logo-256x256.png" alt="Logo de One More Chance" />
      </div>

      <div
        class="flex flex-col jstify-center items-center row-span-2 lg:row-span-2"
      >
        <h1
          class="mt-[0.5em] text-6xl font-bold text-white text-center leading-tight"
        >
          Upss <span class="animate-bounce inline-block">😅</span>
        </h1>
        <p
          class="mt-[0.5em] text-2xl font-semibold text-gray-100 text-center text-pretty"
        >
          {subtitle}
        </p>
        <p
          class="mt-[0.5em] text-gray-300 text-lg text-balance text-center text-ellipsis"
        >
          {#if is404}
            Buscabas la pagina
            <span
              class="ring-1 ring-gray-300 bg-black pt-1 pb-0.5 px-1 mr-1 rounded-md font-medium break-all"
              >{safePathname}</span
            >? parece que su existencia es otro chiste de mal gusto
          {:else if is500s}
            El nivel de los chistes es tan alto que rompimos el servidor,
            intentalo mas tarde
          {:else}
            Algo salio mal, pero no te preocupes, puedes volver al inicio
          {/if}
        </p>
        {#if is500s}
          <p
            class="mt-[1em] text-gray-300 text-sm text-balance text-center text-ellipsis"
          >
            Si piensas que no deberia estar pasando esto puedes comunicarlo en
            nuestro repositiorio de
            <a
              href={PROJECT_REPOSITORY}
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold underline underline-offset-2 transition-all hover:underline-offset-4 hover:decoration-2 hover:text-white"
            >
              Github
            </a>
          </p>
        {/if}
      </div>
    </div>

    <div class="row-start-6 justify-self-center">
      <a href="/" class="button variant-primary">Volver al inicio</a>
    </div>
  </div>

  {#if $page.error?.id}
    <div class="absolute bottom-2 right-1 left-1 flex justify-center">
      <p
        class="text-center text-sm pt-0.5 px-1.5 rounded-md ring-1 ring-red-500 bg-red-500/5 text-red-500/75"
      >
        Error ID: '<span class="font-semibold">{$page.error.id}</span>'
      </p>
    </div>
  {/if}
</main>
