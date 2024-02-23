<script lang="ts">
  import { FILL_SENTENCE_EMPTY_TEXT } from '$comps/game/defaults.js';
  import SentenceCard from './SentenceCard.svelte';
  import type {
    DynamicFragment,
    FillFragment,
    SentenceFragment,
  } from './shared.ts';

  export let current: number | undefined = undefined;
  export let onSelected: (data: FillFragment) => void;
  export let sentence: string;

  export function setFill(idx: number, text: string) {
    if (idx in slots) {
      if (text) {
        slots[idx].text = text;
      } else {
        slots[idx].text = FILL_SENTENCE_EMPTY_TEXT;
      }
      fragments = fragments;
    }
  }

  let fragments: SentenceFragment[] = [];
  let slots: DynamicFragment[] = [];

  function generateFillElements(sentence: string) {
    let elements: SentenceFragment[] = [];
    let fillElements: DynamicFragment[] = [];
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
        text: FILL_SENTENCE_EMPTY_TEXT,
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

<SentenceCard>
  {#each fragments as element (element.id)}
    {#if element.type === 'static'}
      {element.text}{:else}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-no-static-element-interactions -->
      <span
        data-selected={current === element.idx ? '' : undefined}
        title="Espacio {element.idx + 1}"
        on:pointerdown={(e) => {
          e.preventDefault();
          // @ts-expect-error
          onSelected(element);
        }}
        on:click={(e) => {
          e.preventDefault();
          // @ts-expect-error
          onSelected(element);
        }}
        class="text-gray-300 rounded-md px-2 pt-0.5 ring-1 ring-gray-300 break-words cursor-pointer font-normal whitespace-pre-wrap hover:ring-2 data-[selected]:ring-2 data-[selected]:text-gray-100 data-[selected]:ring-purple-600"
        >{element.text}</span
      >{/if}{/each}
</SentenceCard>
