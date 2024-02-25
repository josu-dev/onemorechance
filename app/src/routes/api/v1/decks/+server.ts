import { makeSearchParamsSchema } from '$lib/schemas/shared.ts';
import { decks, sentences } from '$lib/server/db.ts';
import { json } from '@sveltejs/kit';
import { asc, count, eq } from 'drizzle-orm';
import { z } from 'zod';
import type { RequestHandler } from './$types';


const getSchema = makeSearchParamsSchema(z.object({
    page: z.number().optional().default(1),
    limit: z.number().optional().default(10),
    compact: z.boolean().optional().default(false),
}));

export const GET: RequestHandler = async ({ locals, url }) => {
    const queryParams = getSchema.safeParse(url.searchParams);
    if (!queryParams.success) {
        return new Response('Invalid query params', { status: 400 });
    }

    const qp = queryParams.data;

    const decksData = await (locals.db
        .select({
            id: decks.id,
            type: decks.type,
            name: decks.name,
            description: decks.description,
            userId: decks.userId,
            createdAt: decks.createdAt,
            sentencesCount: count(sentences.id)
        })
        .from(decks)
        .leftJoin(sentences, eq(decks.id, sentences.deckId))
        .groupBy(decks.id)
        .orderBy(asc(decks.createdAt))
        .offset((qp.page - 1) * qp.limit)
        .limit(qp.limit)
    );

    let payload: Record<string, unknown>[] = decksData;
    if (qp.compact) {
        payload = [];
        for (const deck of decksData) {
            payload.push({
                id: deck.id,
                t: deck.type,
                n: deck.name,
                d: deck.description,
                uId: deck.userId,
                cAt: deck.createdAt,
                sC: deck.sentencesCount,
            });
        }
    }

    return json(payload);
};
