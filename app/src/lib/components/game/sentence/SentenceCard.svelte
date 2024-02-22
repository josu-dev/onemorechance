<script lang="ts">
  const EMPTY_FILL = '...';

  export let current: number | undefined = undefined;
  export let onSelected: (data: { idx: number; text: string }) => void;
  export let sentence: string;

  export function setFill(idx: number, text: string) {
    if (idx in slots) {
      if (text) {
        slots[idx].text = text;
      } else {
        slots[idx].text = EMPTY_FILL;
      }
      fragments = fragments;
    }
  }

  type StaticFragment = {
    type: 'static';
    id: number;
    text: string;
  };
  type FillFragment = {
    type: 'fill';
    id: number;
    idx: number;
    text: string;
  };
  type AnyFragment = StaticFragment | FillFragment;

  let fragments: AnyFragment[] = [];
  let slots: FillFragment[] = [];

  function generateFillElements(sentence: string) {
    let elements: AnyFragment[] = [];
    let fillElements: FillFragment[] = [];
    let id = 0;
    let idx = 0;
    let text = sentence;
    let match = text.match(/{{.*?}}/);
    while (match) {
      let start = match.index!;
      let matched = match[0];
      if (start > 0) {
        elements.push({ type: 'static', id: id, text: text.slice(0, start) });
        id++;
      }
      const slot = {
        type: 'fill',
        id,
        idx,
        text: EMPTY_FILL,
      } as const;
      elements.push(slot);
      fillElements.push(slot);
      id++;
      idx++;
      text = text.slice(start + matched.length);
      match = text.match(/{{.*?}}/);
    }
    if (text.length > 0) {
      elements.push({ type: 'static', id, text });
    }
    return [elements, fillElements] as const;
  }

  $: [fragments, slots] = generateFillElements(sentence);
</script>

<div class="card variant-primary w-full h-full px-6">
  <p
    class="my-auto text-center text-pretty text-xl line-clamp-[10] break-words overflow-hidden"
  >
    "{#each fragments as element (element.id)}
      {#if element.type === 'static'}
        {element.text}
      {:else}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <span
          class="bg-black-500 text-gray-300 rounded-md px-2 pt-0.5 min-w-8 break-words ring-1 ring-gray-300 font-normal whitespace-pre data-[selected]:text-gray-100 data-[selected]:ring-purple-600"
          data-selected={current === element.idx ? '' : undefined}
          on:pointerdown={(e) => {
            e.preventDefault();
            // @ts-ignore
            onSelected(element);
          }}
          on:click={(e) => {
            e.preventDefault();
            // @ts-ignore
            onSelected(element);
          }}>{element.text}</span
        >{/if}
    {/each}"
  </p>
</div>
