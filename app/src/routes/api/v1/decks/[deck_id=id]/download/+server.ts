import { decks, sentences } from '$lib/server/db.ts';
import { json } from '$lib/server/utils.ts';
import { slugify } from '$lib/utils/index.ts';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';


export const GET: RequestHandler = async ({ locals, params, url }) => {
    const jsonSpaces = url.searchParams.get('pretty') === 'true' ? 2 : undefined;

    const deckQuery = (locals.db
        .select({
            id: decks.id,
            type: decks.type,
            name: decks.name,
            description: decks.description,
            userId: decks.userId,
            createdAt: decks.createdAt
        })
        .from(decks)
        .where(eq(decks.id, params.deck_id))
        .get()
    );
    const sentencesQuery = (locals.db
        .select({ id: sentences.id, text: sentences.text })
        .from(sentences)
        .where(eq(sentences.deckId, params.deck_id))
    );

    const [d, s] = await Promise.all([deckQuery, sentencesQuery]);
    if (!d) {
        error(404, 'No se encontró el mazo a descargar');
    }

    const data = {
        ...d,
        sentences: s
    };

    return json(
        { data },
        {
            headers: {
                'Content-Disposition': `attachment; filename="${slugify(d.name, '_')}.json"`
            }
        },
        jsonSpaces
    );
};
