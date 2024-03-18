<script lang="ts">
  import Seo from '$comps/layout/Seo.svelte';
  import LinkBack from '$comps/shared/LinkBack.svelte';
  import { PROJECT_REPOSITORY } from '$lib/defaults.ts';

  const contributors = [
    {
      name: 'Josue',
      roles: ['Developer', 'Game Developer', 'Game Designer'],
      github: 'https://github.com/josu-dev',
      avatar: 'https://avatars.githubusercontent.com/u/92873227?v=4',
    },
    {
      name: 'Jhonatan',
      roles: ['DevOps', 'Game Designer'],
      github: 'https://github.com/jd-apprentice',
      avatar: 'https://avatars.githubusercontent.com/u/68082746?v=4',
    },
    {
      name: 'Iñaki',
      roles: ['Game Developer', 'Game Designer'],
      github: 'https://github.com/KinnaGt',
      avatar: 'https://avatars.githubusercontent.com/u/81035527?v=4',
    },
    {
      name: 'Juan',
      roles: ['Musician', 'Sound Designer'],
      github: 'https://github.com/buanjautista',
      avatar: 'https://avatars.githubusercontent.com/u/25139238?v=4',
    },
  ] as const;

  const roleClassName = {
    ['Developer']: 'bg-blue-700 hover:bg-blue-600',
    ['Game Developer']: 'bg-green-700 hover:bg-green-600',
    ['Game Designer']: 'bg-yellow-700 hover:bg-yellow-600',
    ['DevOps']: 'bg-red-700 hover:bg-red-600',
    ['Musician']: 'bg-purple-700 hover:bg-purple-600',
    ['Sound Designer']: 'bg-pink-700 hover:bg-pink-600',
  };
</script>

<Seo
  title="Creditos - One More Chance"
  description="Conoce a los creadores y colaboradores que hicieron posible a One More Chance"
/>

<main class="main main-below-header main-with-pb">
  <h1 class="h2 text-white text-center">
    Creditos
    <LinkBack href="/" className="icon-md" />
  </h1>

  <div
    class="flex flex-1 flex-col items-center gap-4 mt-4 mx-auto w-full lg:gap-8"
  >
    <section class="flex flex-col max-w-5xl mx-auto space-y-1 text-center">
      <h2 class="h3 text-gray-100 mb-2">Acerca de One More Chance</h2>
      <p
        class="text-gray-200 text-xl text-pretty max-w-[min(65ch,90vw)] mx-auto"
      >
        El juego es de codigo abierto y esta disponible en <a
          href={PROJECT_REPOSITORY}
          rel="noopener noreferrer"
          target="_blank"
          class="not-prose underline underline-offset-2 transition-all hover:text-white hover:underline-offset-4"
        >
          GitHub.
        </a>
      </p>
      <p
        class="text-gray-200 text-xl text-pretty max-w-[min(65ch,90vw)] mx-auto"
      >
        En el repositorio se encuentra la Licencia asi como tambien las
        librerias, herramientas y servcios utilizados.
      </p>
    </section>

    <section class="flex flex-col max-w-5xl mx-auto text-center">
      <h2 class="h3 text-gray-100 mb-2">Contribuidores</h2>
      <p
        class="text-gray-200 text-xl text-pretty max-w-[min(65ch,90vw)] mx-auto"
      >
        El juego fue posible gracias a la colaboracion de:
      </p>
      <ul
        class="grid grid-cols-[min(80vw,20rem)] gap-y-6 w-max mx-auto mt-4 sm:gap-x-6 md:grid-cols-[repeat(2,20rem)] md:gap-x-8 lg:grid-cols-[repeat(2,28rem)] lg:mt-6 lg:gap-y-8 lg:gap-x-10"
      >
        {#each contributors as contributor (contributor.name)}
          <!-- <li class="w-full max-w-[min(80vw,20rem)] h-full lg:max-w-[28rem]"> -->
          <li class="w-full h-full">
            <a
              href={contributor.github}
              rel="noopener noreferrer"
              target="_blank"
              class="card variant-hover variant-primary h-full lg:flex-row gap-x-4 hover:!scale-[1.025]"
            >
              <div
                class="w-48 max-w-full aspect-square rounded-md overflow-hidden mx-auto transition-transform hover:animate-[0.5s_spin_2s_linear_infinite]"
              >
                <img
                  src={contributor.avatar}
                  alt={contributor.name}
                  class=" object-contain"
                />
              </div>
              <div class="flex-1 mt-4 space-y-2 text-center">
                <p
                  class="text-gray-200 text-lg font-bold w-max mx-auto hover:text-gray-100"
                >
                  {contributor.name}
                </p>
                <div class="flex flex-col items-center gap-1 w-full">
                  {#each contributor.roles as role}
                    <span
                      class="badge {roleClassName[
                        role
                      ]} text-gray-100 text-base m-0 px-4 transition-transform hover:scale-[1.025]"
                    >
                      {role}
                    </span>
                  {/each}
                </div>
              </div>
            </a>
          </li>
        {/each}
      </ul>
    </section>
  </div>
</main>
