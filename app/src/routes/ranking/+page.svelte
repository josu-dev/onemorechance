<script lang="ts">
  import Seo from '$comps/layout/Seo.svelte';
  import LinkBack from '$comps/shared/LinkBack.svelte';
  import Table from '$lib/elements/table/Table.svelte';
  import TableBody from '$lib/elements/table/TableBody.svelte';
  import TableHead from '$lib/elements/table/TableHead.svelte';
  import IconJoystick from '$lib/icons/IconJoystick.svelte';
  import IconMedal from '$lib/icons/IconMedal.svelte';
  import IconPercent from '$lib/icons/IconPercent.svelte';
  import IconTrophy from '$lib/icons/IconTrophy.svelte';

  export let data;

  const user = data.user;

  const userRank = data.userRank ?? Infinity;

  let filteredUsers = data.users;

  const tableCols = [
    { label: 'Posicion', class: 'w-12' },
    { label: 'Nombre', class: 'w-auto' },
    { label: 'Partidas ganadas', class: 'w-16', icon: IconMedal },
    { label: 'Partidas jugadas', class: 'w-16', icon: IconJoystick },
    { label: 'Puntaje promedio', class: 'w-16', icon: IconPercent },
    { label: 'Puntaje total', class: 'w-24', icon: IconTrophy },
  ];
</script>

<Seo
  title="Ranking - One More Chance"
  description="Sos el mas capo de tus amigos o sos el maleta del grupo? Tenele miedo a los que estan arriba y reite de los que estan abajo en el ranking Global de One More Chance"
/>

<main class="main main-p-header">
  <h1 class="h2 text-white text-center">
    Ranking de los mas graciosos
    <LinkBack href="/" className="icon-md" />
  </h1>

  <div
    class="container flex flex-1 flex-col items-center gap-4 w-full mt-4 lg:flex-row-reverse lg:gap-8 lg:items-start lg:justify-center"
  >
    {#if user}
      <section class="px-2 md:px-4 w-full max-w-sm">
        <h2 class="h3 text-gray-100 text-center">Stats personales</h2>
        <div class="my-4 max-w-96">
          <div class="card variant-primary gap-2 px-[10%] xs:px-4">
            <p class="h4 text-center text-gray-100">
              {user.name}
            </p>
            <div>
              <p class="text-lg text-gray-200 font-semibold">Partidas</p>
              <div class="grid xs:grid-cols-2 px-2">
                <p>
                  Jugadas: <span class="text-gray-200 font-bold"
                    >{user.gamesPlayed}</span
                  >
                </p>
                <p>
                  Ganadas: <span class="text-gray-200 font-bold"
                    >{user.gamesWon}</span
                  >
                </p>
              </div>
            </div>
            <div class="ml-auto xs:ml-0">
              <p class="text-lg text-gray-200 font-semibold">Puntaje</p>
              <div class="grid xs:grid-cols-2 px-2">
                <p>
                  Total: <span class="text-gray-200 font-bold"
                    >{user.scoreLifetime}</span
                  >
                </p>
                <p>
                  Promedio: <span class="text-gray-200 font-bold"
                    >{user.scoreLifetime / (user.gamesPlayed || 1)}</span
                  >
                </p>
                <p>
                  Ultimo: <span class="text-gray-200 font-bold"
                    >{user.scoreLastGame}</span
                  >
                </p>
              </div>
            </div>
            <div>
              <p class="text-lg text-gray-200 font-semibold">Ranking</p>
              <div class="grid xs:grid-cols-2 px-2">
                <p>
                  Posicion: <span class="text-gray-200 font-bold"
                    >{userRank + 1}</span
                  >
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    {/if}

    <section class="w-full max-w-[min(640px,90vw)]">
      <h2 class="h3 text-gray-100 text-center">Ranking global</h2>
      <Table className="my-4 max-h-96">
        <TableHead cols={tableCols} />
        <TableBody rows={filteredUsers} let:row let:i>
          <tr>
            <td class="px-3 py-2 text-base font-medium tracking-wider">
              {i + 1}
            </td>
            <td class="px-3 py-2 text-base font-medium tracking-wider">
              {row.name}
            </td>
            <td
              class="px-3 py-2 text-base text-right font-medium tracking-wider"
            >
              {row.gamesWon}
            </td>
            <td
              class="px-3 py-2 text-base text-right font-medium tracking-wider"
            >
              {row.gamesPlayed}
            </td>
            <td
              class="px-3 py-2 text-base text-right font-medium tracking-wider"
            >
              {row.scoreLifetime / (row.gamesPlayed || 1)}
            </td>
            <td
              class="px-3 py-2 text-base text-right font-medium tracking-wider"
            >
              {row.scoreLifetime}
            </td>
          </tr>
        </TableBody>
      </Table>
    </section>
  </div>
</main>
