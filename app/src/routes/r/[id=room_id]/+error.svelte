<script lang="ts">
	import { page } from '$app/stores';
</script>

<main class="main">
  <h1>{$page.error?.message}</h1>
</main>
