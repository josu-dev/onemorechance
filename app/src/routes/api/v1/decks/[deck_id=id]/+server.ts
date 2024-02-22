import { decks, sentences } from '$lib/server/db.ts';
import { makeSearchParamsSchema } from '$lib/utils/searchParams.ts';
import { json } from '@sveltejs/kit';
import { asc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import type { RequestHandler } from './$types';


const getSchema = makeSearchParamsSchema(z.object({
    page: z.number().optional().default(1),
    limit: z.number().optional().default(10),
    compact: z.boolean().optional().default(false),
    random: z.boolean().optional().default(false),
}));

export const GET: RequestHandler = async ({ locals, params, url }) => {
    const queryParams = getSchema.safeParse(url.searchParams);
    if (!queryParams.success) {
        return new Response('Invalid query params', { status: 400 });
    }

    const qp = queryParams.data;

    const deckQuery = (locals.db
        .select(qp.compact ?
            { id: decks.id, t: decks.type, n: decks.name, d: decks.description, uId: decks.userId, c: decks.createdAt } :
            { id: decks.id, type: decks.type, name: decks.name, description: decks.description, userId: decks.userId, createdAt: decks.createdAt }
        )
        .from(decks)
        .where(eq(decks.id, params.deck_id))
        .get()
    );
    const sentencesQuery = (locals.db
        .select(qp.compact ?
            { id: sentences.id, t: sentences.text } :
            { id: sentences.id, text: sentences.text, createdAt: sentences.createdAt }
        )
        .from(sentences)
        .where(eq(sentences.deckId, params.deck_id))
        .orderBy(qp.random ? sql`random()` : asc(sentences.createdAt))
        .limit(qp.limit)
        .offset((qp.page - 1) * qp.limit)
    );

    const [d, s] = await Promise.all([deckQuery, sentencesQuery]);

    if (!d) {
        return new Response('Deck not found', { status: 404 });
    }

    const payload = qp.compact ? { d: d, s: s } : { deck: d, sentences: s };

    return json(payload);
};
