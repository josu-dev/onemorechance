import { customRandom, nanoid, random } from 'nanoid';


export const uniqueURLSafeId = nanoid;

export const uniqueLettersId = customRandom('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10, random);

export const uniqueRoomId = customRandom('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6, random);
