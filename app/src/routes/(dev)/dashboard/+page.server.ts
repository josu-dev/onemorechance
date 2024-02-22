import { decks } from '$lib/server/db.js';
import type { PageServerLoad } from './$types.js';


export const load: PageServerLoad = async ({ locals }) => {
    const decksData = await locals.db.select().from(decks);

    return {
        decks: decksData
    };
};
