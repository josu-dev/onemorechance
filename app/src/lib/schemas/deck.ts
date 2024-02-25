import { DECK_TYPE } from '$shared/constants.js';
import { z } from 'zod';
import * as s from './shared.ts';

/*
    Decks
*/

export const DECK_TYPE_CREATE = { ...DECK_TYPE, UNSET: 'UNSET' as const };

const deckBaseSchema = z.object({
    type: z.nativeEnum(DECK_TYPE).default(DECK_TYPE.COMPLETE),
    name: z.string().trim().min(3).max(64),
    description: z.string().trim().max(255),
    userId: s.nanoIdSchema.nullish(),
});

export const deckInsertSchema = deckBaseSchema.extend({
    type: z.nativeEnum(DECK_TYPE_CREATE).default(DECK_TYPE_CREATE.UNSET),
});

export const deckUpdateSchema = deckBaseSchema;

export const deckDeleteSchema = z.object({
    id: s.nanoIdSchema,
});


export const idListSchema = z.array(z.string());

export const deleteItemsSchema = z.object({
    deckId: z.string(),
    ids: idListSchema,
});

/*
    Sentences
*/

export const sentenceBaseSchema = z.object({
    text: z.string().trim().min(3).max(255),
});

export const sentencesInsertSchema = z.object({
    deckId: s.nanoIdSchema,
    items: z.array(sentenceBaseSchema),
});

export const sentencesDeleteSchema = deleteItemsSchema;

/*
    Options
*/

export const optionBaseSchema = z.object({
    text: z.string().trim().min(2).max(64),
});

export const optionsInsertSchema = z.object({
    deckId: s.nanoIdSchema,
    items: z.array(optionBaseSchema),
});

export const optionsDeleteSchema = deleteItemsSchema;

/*
    Deck full
*/

export const deckUploadSchema = deckBaseSchema.extend({
    sentences: z.array(sentenceBaseSchema).optional(),
    options: z.array(optionBaseSchema).optional(),
});
