import { customRandom, nanoid, random } from 'nanoid';


export function slugify(text: string, space: '' | '-' | '_' = '-'): string {
    return text
        .toLowerCase()
        .replace(/ /g, space)
        .replace(/[^\w-]+/g, '');
}

export const uniqueId = nanoid;

export const uniqueRoomId = customRandom('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6, random);

const ROOM_ID_REGEX = /^[0-9A-Za-z]{6}$/;

export function isRoomId(id: string): boolean {
    return id.match(ROOM_ID_REGEX) !== null;
}

const SENTENCE_FILL_SLOT_REGEX_GLOBAL = /{{.*?}}/g;

export function countFillSlots(sentence: string): number {
    return sentence.match(SENTENCE_FILL_SLOT_REGEX_GLOBAL)?.length ?? 0;
}
