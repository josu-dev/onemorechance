import { DECK_TYPE } from '$game/enums.js';
import { deckUpdateSchema, sentencesAddSchema, sentencesDeleteSchema } from '$lib/schemas/deck.js';
import { deleteSchema } from '$lib/schemas/shared.js';
import { decks, options, sentences } from '$lib/server/db.js';
import { uniqueId } from '$lib/utils/index.js';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { message, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals, params }) => {
    const deck = await locals.db.select().from(decks).where(eq(decks.id, params.deck_id)).get();
    if (!deck) {
        error(404, 'No se encontró el deck que buscas');
    }

    const deck_sentences = await locals.db.select().from(sentences).where(eq(sentences.deckId, deck.id));
    const deck_options = await locals.db.select().from(options).where(eq(options.deckId, deck.id));

    const deckUpdateForm = await superValidate(
        deck, zod(deckUpdateSchema)
    );
    const deckDeleteForm = await superValidate(
        { id: deck.id }, zod(deleteSchema)
    );
    const seDefault = { deckId: deck.id };
    const seInsertForm = await superValidate(seDefault, zod(sentencesAddSchema));
    const seDeleteForm = await superValidate(seDefault, zod(sentencesDeleteSchema));

    return {
        deck: deck,
        deckSentences: deck_sentences,
        deckOptions: deck_options,
        deckUpdateForm,
        deckDeleteForm,
        seInsertForm,
        seDeleteForm
    };
};

export const actions: Actions = {
    deck_delete: async ({ locals, request }) => {
        const form = await superValidate(request, zod(deleteSchema));
        if (!form.valid) {
            fail(400, { form });
        }

        await locals.db.delete(decks).where(eq(decks.id, form.data.id)).execute();
    },
    deck_update: async ({ locals, request }) => {
        const form = await superValidate(request, zod(deckUpdateSchema));
        if (!form.valid) {
            fail(400, { form });
        }

        await locals.db.update(decks).set({
            name: form.data.name,
            description: form.data.description
        }).where(eq(decks.id, form.data.id)).execute();
    },
    sentences_add: async ({ locals, request }) => {
        const form = await superValidate(request, zod(sentencesAddSchema));
        if (!form.valid) {
            return fail(400, { form });
        }
        const deckId = await locals.db.select().from(decks).where(eq(decks.id, form.data.deckId)).get();
        if (!deckId) {
            return fail(404, { form });
        }
        if (form.data.sentences.length === 0) {
            return fail(400, { form });
        }

        const values: typeof sentences.$inferInsert[] = [];

        for (const sentence of form.data.sentences) {
            values.push({
                id: uniqueId(),
                deckId: form.data.deckId,
                text: sentence.text
            });
        }

        const insertedSentences = await locals.db.insert(sentences).values(values).returning().execute();

        return message(form, { sentences: insertedSentences });
    },
    options_add: async ({ locals, request }) => {
        const form = await superValidate(request, zod(sentencesAddSchema));
        if (!form.valid) {
            return fail(400, { form });
        }
        const deck = await locals.db.select().from(decks).where(eq(decks.id, form.data.deckId)).get();
        if (!deck) {
            return fail(404, { form });
        }
        if (deck.type !== DECK_TYPE.CHOOSE) {
            return fail(400, { form });
        }

        const values: typeof sentences.$inferInsert[] = [];

        for (const sentence of form.data.sentences) {
            values.push({
                id: uniqueId(),
                deckId: form.data.deckId,
                text: sentence.text
            });
        }

        const insertedSentences = await locals.db.insert(sentences).values(values).returning().execute();

        return message(form, { sentences: insertedSentences });
    },
};
