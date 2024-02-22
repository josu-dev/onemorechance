<script lang="ts">
  const FILL_MAX_LENGTH = 64;

  export let current: number;
  export let totalInputs: number = 0;
  export let onEnter: (data: { idx: number; text: string }) => void;
  export let onFill: (data: { idx: number; text: string }) => void;
  export let onSelected: (data: { idx: number; text: string }) => void;
  export let onUnselected: () => void;

  type Input = {
    idx: number;
    text: string;
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
      <div
        contenteditable="plaintext-only"
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
          if (input.text.length > FILL_MAX_LENGTH) {
            input.text = input.text.slice(0, FILL_MAX_LENGTH);
            e.currentTarget.textContent = input.text;
          }
          onFill(input);
        }}
        on:keydown={(e) => {
          if (e.key === 'Enter') {
            onEnter(input);
          }
        }}
        class="input variant-primary w-full resize-none break-words text-center text-pretty text-lg line-clamp-2 max-w-full text-ellipsis overflow-y-auto whitespace-pre"
      />
    {/each}
  </div>
</div>
