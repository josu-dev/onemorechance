import { deckUpdateSchema, optionsDeleteSchema, optionsInsertSchema, sentencesDeleteSchema, sentencesInsertSchema } from '$lib/schemas/deck.js';
import { deleteSchema } from '$lib/schemas/shared.js';
import { decks, options, sentences } from '$lib/server/db.js';
import { countFillSlots, uniqueId } from '$lib/utils/index.js';
import { DECK_TYPE } from '$shared/constants.js';
import { LibsqlError } from '@libsql/client';
import { error, fail } from '@sveltejs/kit';
import { and, eq, inArray } from 'drizzle-orm';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types.js';


export const load: PageServerLoad = async ({ locals, params }) => {
    const deck = await locals.db.select().from(decks).where(eq(decks.id, params.deck_id)).get();
    if (!deck) {
        error(404, { friendly: 'No se encontro el deck que buscas' });
    }

    const deckSentences = await locals.db.select().from(sentences).where(eq(sentences.deckId, deck.id));

    let deckOptions: typeof options.$inferSelect[] = [];
    if (deck.type !== DECK_TYPE.COMPLETE) {
        deckOptions = await locals.db.select().from(options).where(eq(options.deckId, deck.id));
    }

    const seDefault = { deckId: deck.id };
    const [
        deckUpdateForm, deckDeleteForm,
        seInsertForm, seDeleteForm,
        opInsertForm, opDeleteForm
    ] = await Promise.all([
        superValidate(deck, zod(deckUpdateSchema)),
        superValidate(deck, zod(deleteSchema)),
        superValidate(seDefault, zod(sentencesInsertSchema), { id: 'sentencesInsert' }),
        superValidate(seDefault, zod(sentencesDeleteSchema), { id: 'sentencesDelete' }),
        superValidate(seDefault, zod(optionsInsertSchema), { id: 'optionsInsert' }),
        superValidate(seDefault, zod(optionsDeleteSchema), { id: 'optionsDelete' })
    ]);

    return {
        deck: {
            data: deck,
            deleteForm: deckDeleteForm,
            updateForm: deckUpdateForm,
        },
        sentences: {
            data: deckSentences,
            deleteForm: seDeleteForm,
            insertForm: seInsertForm,
        },
        options: {
            data: deckOptions,
            deleteForm: opDeleteForm,
            insertForm: opInsertForm,
        },
    };
};

export const actions: Actions = {
    deck_delete: async ({ locals, request }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }
        const form = await superValidate(request, zod(deleteSchema));
        if (!form.valid) {
            return fail(400, { form });
        }
        if (!form.data.confirm) {
            return setError(form, 'confirm', 'Debes confirmar la eliminacion');
        }

        await (locals.db
            .delete(decks)
            .where(and(
                eq(decks.id, form.data.id),
                eq(decks.userId, locals.user.id)
            ))
        );

        return { form };
    },
    deck_update: async ({ locals, params, request }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }
        const form = await superValidate(request, zod(deckUpdateSchema));
        if (!form.valid) {
            return fail(400, { form });
        }

        const updatedDeck = await (locals.db
            .update(decks)
            .set({
                name: form.data.name,
                description: form.data.description
            })
            .where(and(
                eq(decks.id, params.deck_id),
                eq(decks.userId, locals.user.id)
            ))
            .returning()
            .get()
        );

        if (!updatedDeck) {
            return setError(form, '', 'No se encontro el deck que buscas o no tienes permisos para editarlo');
        }

        return message(form, { deck: updatedDeck });
    },
    sentences_delete: async ({ locals, request }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }
        const form = await superValidate(request, zod(sentencesDeleteSchema));
        if (!form.valid) {
            return fail(400, { form });
        }

        const deck = await (locals.db
            .select({ id: decks.id })
            .from(decks)
            .where(and(
                eq(decks.id, form.data.deckId),
                eq(decks.userId, locals.user.id)
            ))
            .get()
        );
        if (!deck) {
            return setError(form, '', 'No se encontro el deck que buscas o no tienes permisos para editarlo');
        }

        const deletedIds = await locals.db.delete(sentences).where(
            inArray(sentences.id, form.data.ids)
        ).returning({ id: sentences.id });

        return message(form, { deleted: deletedIds });
    },
    sentences_insert: async ({ locals, request }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }
        const form = await superValidate(request, zod(sentencesInsertSchema));
        if (!form.valid) {
            return fail(400, { form });
        }
        if (form.data.items.length === 0) {
            return setError(form, '', 'No hay sentencias para insertar');
        }

        const deck = await (locals.db
            .select({ id: decks.id })
            .from(decks)
            .where(and(
                eq(decks.id, form.data.deckId),
                eq(decks.userId, locals.user.id)
            ))
            .get()
        );
        if (!deck) {
            return setError(form, '', 'No se encontro el deck que buscas o no tienes permisos para editarlo');
        }

        const values: typeof sentences.$inferInsert[] = [];
        for (let i = 0; i < form.data.items.length; i++) {
            const sentenceText = form.data.items[i].text;
            if (!countFillSlots(sentenceText)) {
                setError(form, `items[${i}].text`, 'La sentencia no tiene espacios para llenar');
                continue;
            }

            values.push({
                id: uniqueId(),
                deckId: deck.id,
                text: sentenceText
            });
        }
        if (!form.valid) {
            return fail(400, { form });
        }

        let inserted: typeof sentences.$inferSelect[];
        try {
            inserted = await locals.db.insert(sentences).values(values).returning();
        }
        catch (e) {
            if (e instanceof LibsqlError && e.code === 'SQLITE_CONSTRAINT') {
                return fail(400, { form, message: 'Error al insertar sentencias' });
            }

            return fail(500, { form, message: 'Error al insertar sentencias' });
        }

        return message(form, { inserted: inserted });
    },
    options_delete: async ({ locals, request }) => {
        const form = await superValidate(request, zod(optionsDeleteSchema));
        if (!form.valid) {
            return fail(400, { form });
        }

        const deletedIds = await locals.db.delete(options).where(
            inArray(options.id, form.data.ids)
        ).returning({ id: options.id });

        return message(form, { deleted: deletedIds });
    },
    options_insert: async ({ locals, request }) => {
        const form = await superValidate(request, zod(optionsInsertSchema));
        if (!form.valid) {
            return fail(400, { form });
        }
        const deckId = await locals.db.select().from(decks).where(eq(decks.id, form.data.deckId)).get();
        if (!deckId) {
            return fail(404, { form });
        }
        if (form.data.items.length === 0) {
            return fail(400, { form });
        }

        const values: typeof options.$inferInsert[] = [];

        for (const option of form.data.items) {
            values.push({
                id: uniqueId(),
                deckId: form.data.deckId,
                text: option.text
            });
        }

        const insertedOptions = await locals.db.insert(options).values(values).returning().execute();

        return message(form, { inserted: insertedOptions });
    },
};
