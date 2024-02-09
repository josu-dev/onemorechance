import { z } from 'zod';
import { DECK_TYPE } from '$game/enums.js';

/*
    Decks
*/

export const deckType = z.nativeEnum({...DECK_TYPE, UNSET: 'UNSET'})

export const DECK_TYPE_CREATE = {...DECK_TYPE, UNSET: 'UNSET'};

const deckBaseSchema = z.object({
    type: z.nativeEnum(DECK_TYPE_CREATE).default(DECK_TYPE_CREATE.UNSET),
  name: z.string(),
  description: z.string(),
});

export const deckCreateSchema = deckBaseSchema;

export const deckUpdateSchema = deckBaseSchema.extend({
  id: z.string(),
});

export const deckDeleteSchema = z.object({
  id: z.string(),
});


export const itemBaseSchema = z.object({
    text: z.string(),
});

export const idListSchema = z.array(z.string());

export const deleteItemsSchema = z.object({
    deckId: z.string(),
    ids: idListSchema,
});

/*
    Sentences
*/

export const sentenceBaseSchema = itemBaseSchema;

export const sentencesAddSchema = z.object({
    deckId: z.string(),
    sentences: z.array(sentenceBaseSchema),
});

export const sentencesDeleteSchema = deleteItemsSchema

/*
    Options
*/

export const optionBaseSchema = itemBaseSchema;

export const optionsAddSchema = z.object({
    deckId: z.string(),
    options: z.array(optionBaseSchema),
});

export const optionsDeleteSchema = deleteItemsSchema
