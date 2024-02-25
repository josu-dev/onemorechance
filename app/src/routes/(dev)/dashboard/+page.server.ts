import { deckUploadSchema } from '$lib/schemas/deck.js';
import { fileSchema, fromJsonFileSchema } from '$lib/schemas/shared.js';
import { decks, options, sentences } from '$lib/server/db.js';
import { log } from '$lib/server/utils.js';
import { DECK_TYPE } from '$shared/constants.js';
import { fail } from '@sveltejs/kit';
import { nanoid } from 'nanoid';
import { setError, superValidate, withFiles } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { PageServerLoad } from './$types.js';


const jsonDeckSchema = fromJsonFileSchema(deckUploadSchema);


export const load: PageServerLoad = async ({ locals }) => {
    const decksData = await locals.db.select().from(decks);

    const deckUploadForm = await superValidate(zod(fileSchema));

    return {
        decks: decksData,
        deckUploadForm: deckUploadForm
    };
};


export const actions = {
    deck_upload: async ({ locals, request }) => {
        const form = await superValidate(request, zod(fileSchema));
        if (!form.valid) {
            log.dev(`deck_upload: invalid form`, form.errors);
            return fail(400, withFiles({ form }));
        }
        if (!locals.user) {
            return setError(form, '', 'No estas logueado');
        }

        const deckJson = await jsonDeckSchema.safeParseAsync(form.data.file);
        if (!deckJson.success) {
            log.dev(`deck_upload: invalid JSON`, deckJson.error);
            return setError(form, 'file', 'El archivo no es un JSON valido');
        }
        if (!deckJson.data.type) {
            return setError(form, 'file', 'El archivo no contiene el tipo de mazo');
        }

        const deckId = nanoid();

        await locals.db.insert(decks).values([{
            id: deckId,
            type: deckJson.data.type,
            name: deckJson.data.name,
            description: deckJson.data.description,
            userId: deckJson.data.userId ?? null
        }]);

        if (deckJson.data.sentences?.length) {
            const sentencesData: typeof sentences.$inferInsert[] = [];
            for (const s of deckJson.data.sentences ?? []) {
                sentencesData.push({
                    id: nanoid(),
                    deckId: deckId,
                    text: s.text
                });
            }
            await locals.db.insert(sentences).values(sentencesData);
        }

        if (deckJson.data.type === DECK_TYPE.SELECT && deckJson.data.options?.length) {
            const optionsData: typeof options.$inferInsert[] = [];
            for (const o of deckJson.data.options ?? []) {
                optionsData.push({
                    id: nanoid(),
                    deckId: deckId,
                    text: o.text
                });
            }
            await locals.db.insert(sentences).values(optionsData);
        }

        return withFiles({ form });
    }
};
