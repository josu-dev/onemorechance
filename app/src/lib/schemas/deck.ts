import { DECK_TYPE } from '$shared/constants.js';
import { z } from 'zod';

/*
    Decks
*/

export const DECK_TYPE_CREATE = { ...DECK_TYPE, UNSET: 'UNSET' as const };

export const deckType = z.nativeEnum(DECK_TYPE_CREATE);

const deckBaseSchema = z.object({
    type: z.nativeEnum(DECK_TYPE_CREATE).default(DECK_TYPE_CREATE.UNSET),
    name: z.string(),
    description: z.string(),
});

export const deckInsertSchema = deckBaseSchema;

export const deckUpdateSchema = deckBaseSchema.extend({
    id: z.string(),
});

export const deckDeleteSchema = z.object({
    id: z.string(),
});


export const itemBaseSchema = z.object({
    text: z.string(),
});

export const itemsInsertSchema = z.object({
    deckId: z.string(),
    items: z.array(itemBaseSchema),
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

export const sentencesInsertSchema = itemsInsertSchema;

export const sentencesDeleteSchema = deleteItemsSchema;

/*
    Options
*/

export const optionBaseSchema = itemBaseSchema;

export const optionsInsertSchema = itemsInsertSchema;

export const optionsDeleteSchema = deleteItemsSchema;
