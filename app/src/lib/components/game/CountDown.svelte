<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { COUNTDOWN_UPDATE_RATE } from './defaults.ts';

  export let start = false;
  export let duration: number;
  export let className = '';

  let last_time = window.performance.now();
  let elapsed = 0;
  let remainingSeconds = (duration / 1000).toString();
  let remainingMillis = '99';

  let timeoutId: ReturnType<typeof setTimeout>;

  const dispatch = createEventDispatcher<{
    start: void;
    end: void;
  }>();

  function update() {
    if (elapsed < duration) {
      timeoutId = setTimeout(update, COUNTDOWN_UPDATE_RATE);
    } else {
      dispatch('end');
    }

    const time = window.performance.now();
    elapsed += Math.min(time - last_time, duration - elapsed);
    last_time = time;
    remainingSeconds = Math.floor((duration - elapsed) / 1000)
      .toString()
      .padStart(2, ' ');
    remainingMillis = Math.floor((duration - elapsed) % 1000)
      .toString()
      .slice(0, 2)
      .padStart(2, '0');
  }

  $: if (start) {
    dispatch('start');
    update();
  }

  onMount(() => {
    return () => {
      clearTimeout(timeoutId);
    };
  });
</script>

<div
  class="flex justify-center items-end tracking-wider font-semibold font-mono {className}"
>
  <span class="text-2xl whitespace-pre">{remainingSeconds}</span>
  <span class="tetx-2xl">.</span>
  <span class="text-xl">{remainingMillis}</span>
</div>
