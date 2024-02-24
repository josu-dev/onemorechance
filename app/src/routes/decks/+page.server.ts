import { DECK_TYPE_CREATE, deckInsertSchema } from '$lib/schemas/deck.js';
import { decks } from '$lib/server/db.js';
import { uniqueId } from '$lib/utils/index.js';
import { t } from '$lib/utils/translate_constants.js';
import { fail } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types.js';


export const load: PageServerLoad = async ({ locals }) => {
    const decksData = await locals.db.select().from(decks);

    const insertForm = await superValidate(zod(deckInsertSchema));

    return {
        decks: decksData,
        createForm: insertForm
    };
};

export const actions: Actions = {
    create: async ({ locals, request }) => {
        if (!locals.user) {
            return fail(401, { message: 'Unauthorized' });
        }

        const form = await superValidate(request, zod(deckInsertSchema));
        if (!form.valid) {
            return fail(400, { form });
        }
        if (form.data.type === DECK_TYPE_CREATE.UNSET) {
            return setError(form, 'type', 'Debe seleccionar un tipo de deck');
        }
        if (form.data.type === DECK_TYPE_CREATE.SELECT) {
            return setError(form, 'type', `El tipo de deck ${t.deckType(
                DECK_TYPE_CREATE.SELECT,
            )} no esta disponible en este momento`);
        }

        const insertedDeck = await locals.db.insert(decks).values({
            id: uniqueId(),
            type: form.data.type,
            name: form.data.name,
            description: form.data.description,
            userId: locals.user.id
        }).returning().get();

        return message(form, { deck: insertedDeck });
    }
};
