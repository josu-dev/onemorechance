<script lang="ts">
  import { FILL_SENTENCE_MAX_LENGTH } from '$comps/game/defaults.js';
  import type { FillFragment } from './shared.ts';

  export let current: number;
  export let totalInputs: number = 0;
  export let onEnter: (data: FillFragment) => void;
  export let onFill: (data: FillFragment) => void;
  export let onSelected: (data: FillFragment) => void;
  export let onUnselected: () => void;

  type Input = FillFragment & {
    el?: HTMLDivElement;
  };

  let inputs: Input[] = [];

  function generateInputs(n: number) {
    let elements: Input[] = [];
    for (let i = 0; i < n; i++) {
      elements.push({ idx: i, text: '' });
    }
    return elements;
  }

  $: inputs = generateInputs(totalInputs);

  $: if (current in inputs) {
    inputs[current].el?.focus();
  }
</script>

<div class="w-full my-auto">
  <div class="flex flex-col gap-2 w-full md:gap-4">
    {#each inputs as input (input.idx)}
      <!-- content editable must be "" or "true", "plaintext-only" breaks on firefox -->
      <!-- firebox no supports line-clamp properly :( -->
      <div
        contenteditable
        role="textbox"
        tabindex="0"
        title="Completar espacio {input.idx + 1}"
        bind:this={input.el}
        on:blur={(e) => {
          onUnselected();
        }}
        on:focus={(e) => {
          onSelected(input);
        }}
        on:input={(e) => {
          input.text = e.currentTarget.textContent ?? '';
          if (input.text.length > FILL_SENTENCE_MAX_LENGTH) {
            input.text = input.text.slice(0, FILL_SENTENCE_MAX_LENGTH);
            e.currentTarget.textContent = input.text;
          }
          onFill(input);
        }}
        on:keydown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            onEnter(input);
            return;
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            input.el?.blur();
            return;
          }
          if (
            e.key !== 'Backspace' &&
            input.text.length === FILL_SENTENCE_MAX_LENGTH
          ) {
            if (
              !e.key.startsWith('Arrow') &&
              !((e.ctrlKey || e.metaKey) && e.key === 'a')
            ) {
              const selection = window.getSelection();
              if (selection?.isCollapsed) {
                e.preventDefault();
              }
            }
          }
        }}
        class="input variant-primary w-full resize-none break-words text-center text-pretty text-lg line-clamp-2 max-w-full text-ellipsis overflow-y-auto whitespace-pre"
      />
    {/each}
  </div>
</div>
