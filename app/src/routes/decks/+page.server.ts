import { deckCreateSchema } from '$lib/schemas/deck.js';
import { decks } from '$lib/server/db.js';
import { uniqueId } from '$lib/utils/index.js';
import { fail } from '@sveltejs/kit';
import { zod } from 'sveltekit-superforms/adapters';
import { message, superValidate } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
    const createForm = await superValidate(zod(deckCreateSchema));

    return {
        createForm
    };
};

export const actions: Actions = {
    new: async ({ request, locals }) => {
        const form = await superValidate(request, zod(deckCreateSchema));
        if (!form.valid) {
            fail(400, { form });
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
