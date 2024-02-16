<script lang="ts">
  import { goto } from '$app/navigation';
  import FieldText from '$lib/elements/form/FieldText.svelte';
  import { audioPlayer } from '$lib/stores/audio.js';
  import { user } from '$lib/stores/user.js';
  import { onMount } from 'svelte';
  import { superForm } from 'sveltekit-superforms';

  export let data;

  const registerSForm = superForm(data.account.registerForm, {
    invalidateAll: false,
    onUpdated({ form }) {
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
      const room = form.message.room;
      goto(`/r/${room.id}`);
    },
  });

  const roomJoinSForm = superForm(data.room.joinForm, {
    invalidateAll: false,
    onUpdated({ form }) {
      const room = form.message.room;
      goto(`/r/${room.id}`);
    },
  });

  onMount(() => {
    function startLobbyMusic() {
      audioPlayer.play('music_lobby.mp3', { loop: true });
      document.removeEventListener('click', startLobbyMusic);
    }

    document.addEventListener('click', startLobbyMusic);

    return () => {
      document.removeEventListener('click', startLobbyMusic);
    };
  });
</script>

<svelte:head>
  <title>One More Chance</title>
</svelte:head>

<main class="main justify-center pb-0">
  <h1 class="text-4xl text-white font-bold text-center mb-2">
    ONE MORE CHANCE
  </h1>

  <div
    class="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8"
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
            Crea tu cuenta 😉
          </p>
          <form
            method="post"
            action="?/account_register"
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
