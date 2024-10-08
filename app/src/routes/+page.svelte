<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import Seo from '$comps/layout/Seo.svelte';
  import FieldText from '$lib/elements/form/FieldText.svelte';
  import { audioPlayer } from '$lib/stores/audio.js';
  import { user } from '$lib/stores/user.js';
  import { onFirstUserInteraction, toast } from '$lib/utils/clientside.js';
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';

  export let data;

  const registerSForm = superForm(data.account.registerForm, {
    invalidateAll: false,
    onUpdated({ form }) {
      if (!form.valid) {
        toast.formLevelErrors(form.errors);
        if (!form.message?.user) {
          return;
        }
      }

      const _user = form.message.user;
      user.mset(_user);
    },
  });

  let playMenu = false;

  function togglePlayMenu() {
    playMenu = !playMenu;
  }

  const roomCreateSForm = superForm(data.room.createForm, {
    invalidateAll: false,
    onUpdated({ form }) {
      if (!form.valid) {
        toast.formLevelErrors(form.errors);
        return;
      }

      toast.success('Sala creada, cargando...');
      const room = form.message.room;
      goto(`/r/${room.id}`);
    },
  });

  const roomJoinSForm = superForm(data.room.joinForm, {
    invalidateAll: false,
    onUpdated({ form }) {
      if (!form.valid) {
        toast.formLevelErrors(form.errors);
        return;
      }

      toast.success('Uniendo a sala, cargando...');
      const room = form.message.room;
      goto(`/r/${room.id}`);
    },
  });

  $: registerFormAction = `?/account_register&${$page.url.searchParams.toString()}`;

  onMount(() => {
    const musicCleanup = onFirstUserInteraction(() => {
      audioPlayer.play('music_lobby.mp3', { loop: true });
    });

    return () => {
      musicCleanup();
      audioPlayer.stop('music_lobby.mp3');
    };
  });
</script>

<Seo
  title="One More Chance"
  description="Listo para mostrarle a tus amigos que si sos el mas capo?, o bueno un intento de comico. Juga con tus amigos y obligalos a reir de tus casi chistes"
/>

<main class="main justify-center">
  <h1 class="text-4xl text-white font-bold text-center mb-2">
    ONE MORE CHANCE
  </h1>

  <div
    class="flex flex-col items-center justify-center gap-4 md:flex-row md:gap-8 lg:gap-16"
  >
    <div class="flex my-2">
      <img
        src="/logo/logo-896x896.png"
        alt="Logo de One More Chance"
        class="max-h-[25vh] md:max-h-[40vh]"
      />
    </div>

    <div class="flex flex-col justify-items-center items-center">
      {#if !$user}
        <section class="flex flex-col gap-4 md:gap-5 w-48 max-w-[90vw]">
          <h2 class="sr-only">Menu cuenta</h2>
          <p class="text-center text-gray-50 text-2xl font-semibold">
            Crea tu cuenta <span class="animate-bounce inline-block mt-2"
              >😉</span
            >
          </p>
          <form
            action={registerFormAction}
            method="post"
            use:registerSForm.enhance
            class="flex flex-col items-center gap-3"
          >
            <FieldText
              form={registerSForm}
              field="name"
              label="Nombre"
              labelHidden
              placeholder="tu nombre..."
              className="mt-0 w-full [&_input]:text-center"
            />
            <button type="submit" class="button variant-primary w-full">
              Registrar
            </button>
          </form>
        </section>
      {:else if !playMenu}
        <section class="flex flex-col gap-4 md:gap-5 w-48 max-w-[90vw]">
          <h2 class="sr-only">Menu principal</h2>
          <p class="text-center text-gray-50 text-2xl font-semibold mb-2">
            Hola {$user.name}!
          </p>
          <button on:click={togglePlayMenu} class="button variant-primary">
            Jugar
          </button>
          <a href="/decks" class="button variant-primary">Decks</a>
          <a href="/ranking" class="button variant-primary">Ranking</a>
        </section>
      {:else}
        <section class="flex flex-col gap-4 md:gap-5 w-48 max-w-[90vw]">
          <h2 class="sr-only">Menu partida</h2>
          <form
            action="?/room_create"
            method="post"
            use:roomCreateSForm.enhance
            class="flex"
          >
            <button type="submit" class="button variant-primary w-full">
              Crear sala
            </button>
          </form>
          <form
            action="?/room_join"
            method="post"
            use:roomJoinSForm.enhance
            class="flex flex-col items-center gap-3"
          >
            <FieldText
              form={roomJoinSForm}
              field="id"
              label="Codigo de sala"
              labelHidden
              placeholder="codigo..."
              className="w-full [&_input]:text-center"
            />
            <button type="submit" class="button variant-primary w-full">
              Unirse a sala
            </button>
          </form>
          <button on:click={togglePlayMenu} class="button variant-primary">
            Volver
          </button>
        </section>
      {/if}
    </div>
  </div>
</main>
