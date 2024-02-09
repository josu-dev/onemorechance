import { customRandom, nanoid, random } from 'nanoid';


export const uniqueLettersId = customRandom('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 16, random);

export const uniqueRoomId = customRandom('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6, random);

export const uniqueURLSafeId = nanoid;

export const uniqueId = nanoid;
