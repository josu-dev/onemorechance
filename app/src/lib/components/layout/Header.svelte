<script lang="ts">
  import MainMenu from '$comps/AppMenu.svelte';
</script>

<header class="fixed top-0 left-0 right-0 flex justify-between px-2 py-2 md:px-4 md:pt-4">
  <div>
    <a href="/">
      <span class="sr-only">Inicio</span>
      <div class="aspect-square w-6">
        <img src="/logo/logo-64x64.png" alt="Logo" />
      </div>
    </a>
  </div>

  <div class="">
    <MainMenu />
  </div>
</header>
