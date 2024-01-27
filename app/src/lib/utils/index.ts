import { customRandom, random } from 'nanoid';

export const randomLettersId = customRandom('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10, random);
