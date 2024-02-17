<script>
  import { page } from '$app/stores';
  import { openGraph } from '$lib/configs.ts';

  /**
   * The title of the page
   * @type {string}
   */
  export let title;
  /**
   * The description of the page
   * @type {string}
   */
  export let description;
  /**
   * The canonical URL of the page
   * @type {'current' | ({} & string)}
   */
  export let canonical = 'current';
  /**
   * The locale of the page
   * @type {`${string}_${string}`}
   */
  export let locale = 'es_AR';
  /**
   * The name of the site
   * @type {string}
   */
  export let siteName = openGraph.siteName;
  /**
   * The title of the page for Open Graph
   * @type {string | undefined}
   */
  export let titleOg = undefined;
  /**
   * The type of the page
   * @type {'article' | 'website'}
   */
  export let type = 'website';
  /**
   * The URL of the page
   * @type {'current' | ({} & string)}
   */
  export let url = 'current';
  /**
   * The image related to the page
   * @type {{url: string, alt: string, width: string, height: string}}
   */
  export let image = {
    url: openGraph.image,
    alt: openGraph.imageAlt,
    width: openGraph.imageWidth,
    height: openGraph.imageHeight,
  };

  const currentUrl =
    $page.url.origin + ($page.url.pathname === '/' ? '' : $page.url.pathname);
</script>

<svelte:head>
  <title>{title}</title>
  <meta name="description" content={description} />
  <link
    rel="canonical"
    href={canonical === 'current' ? currentUrl : canonical}
  />
  <meta property="og:locale" content={locale} />
  <meta property="og:site_name" content={siteName} />
  <meta property="og:title" content={titleOg ?? title} />
  <meta property="og:type" content={type} />
  <meta property="og:url" content={url === 'current' ? currentUrl : url} />
  <meta property="og:description" content={description} />
  {#if image}
    <meta property="og:image" content={image.url} />
    <meta property="og:image:alt" content={image.alt} />
    <meta property="og:image:width" content={image.width} />
    <meta property="og:image:height" content={image.height} />
  {/if}
  <slot />
</svelte:head>
