import { customRandom, nanoid, random } from 'nanoid';


export function slugify(text: string, space: '' | '-' | '_' = '-'): string {
    return text
        .toLowerCase()
        .replace(/ /g, space)
        .replace(/[^\w-]+/g, '');
}

export const uniqueId = nanoid;

export const uniqueRoomId = customRandom('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6, random);
