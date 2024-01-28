<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let rounds: number;
  export let timeToCompletePhrase: number;

  const dispacher = createEventDispatcher<{ save: true }>();
</script>

<form on:submit|preventDefault={() => dispacher('save', true)}>
  <div>
    <label class="label">
      <span>Rondas <b>{rounds}</b></span>
      <input type="range" min="5" max="20" step="1" bind:value={rounds} />
    </label>
  </div>
  <div>
    <label class="label">
      <span>Tiempo completar frase <b>{timeToCompletePhrase}</b> s</span>
      <input type="range" min="10" max="30" step="1" bind:value={timeToCompletePhrase} />
    </label>
  </div>

  <button type="submit">Guardar cambios</button>
</form>
