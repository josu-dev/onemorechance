import { DECK_TYPE_CREATE, deckInsertSchema } from '$lib/schemas/deck.js';
import { decks } from '$lib/server/db.js';
import { uniqueId } from '$lib/utils/index.js';
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
    create: async ({ request, locals }) => {
        const form = await superValidate(request, zod(deckInsertSchema));
        if (!form.valid) {
            return fail(400, { form });
        }
        if (form.data.type === DECK_TYPE_CREATE.UNSET) {
            return setError(form, 'type', 'Debe seleccionar un tipo de deck');
        }

        const insertedDeck = await locals.db.insert(decks).values({
            id: uniqueId(),
            type: form.data.type,
            name: form.data.name,
            description: form.data.description,
        }).returning().get();

        return message(form, { deck: insertedDeck });
    }
};
