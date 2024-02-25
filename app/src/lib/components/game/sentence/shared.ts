import { FILL_SENTENCE_EMPTY_TEXT } from '$comps/game/defaults.js';


export type FillFragment = {
    idx: number;
    text: string;
};

type StaticFragment = {
    type: 'static';
    id: number;
} & Pick<FillFragment, 'text'>;

export type DynamicFragment = {
    type: 'fill';
    id: number;
} & FillFragment;

export type SentenceFragment = StaticFragment | DynamicFragment;

const SENTENCE_FILL_REGEX = /{{.*?}}/;

export function generateFillElements(sentence: string): [SentenceFragment[], DynamicFragment[]] {
    const elements: SentenceFragment[] = [];
    const fillElements: DynamicFragment[] = [];
    let id = 0;
    let idx = 0;
    let text = sentence;
    let match = text.match(SENTENCE_FILL_REGEX);
    while (match) {
        const start = match.index!;
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
        text = text.slice(start + match[0].length);
        match = text.match(SENTENCE_FILL_REGEX);
    }
    if (text.length > 0) {
        elements.push({ type: 'static', id, text });
    }
    return [elements, fillElements];
}

const SENTENCE_FILL_REGEX_GLOBAL = /{{.*?}}/g;

export function countFillSlots(sentence: string): number {
    return sentence.match(SENTENCE_FILL_REGEX_GLOBAL)?.length ?? 0;
}
