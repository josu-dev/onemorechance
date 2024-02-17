import { createClient } from '@libsql/client';
import * as dotenv from "dotenv";
import { drizzle } from 'drizzle-orm/libsql';
import { nanoid } from 'nanoid';
import fs from 'node:fs';
import type { Deck } from '../src/shared/types.ts';
import * as schema from './schema';

dotenv.config({ path: ".env.local" });

export const client = createClient({
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_DB_AUTH_TOKEN!
});

export const db = drizzle(client, { schema });

async function main() {
    const defaultDecks = JSON.parse(fs.readFileSync('static/decks/default.json', 'utf-8')) as Record<string, Deck>;

    console['info']("🌱 Seeding the database with default decks");

    await db.transaction(async (tx) => {
        await Promise.all(
            Object.values(defaultDecks).map(async (deck) => {
                console['info'](`🌱 Seeding deck: ${deck}`);
                const deckId = nanoid();
                await tx.insert(schema.decks).values({
                    id: deckId,
                    type: deck.type,
                    name: deck.name,
                    description: deck.description ?? '',
                });

                const promises: Promise<any>[] = [];

                const s: typeof schema.sentences.$inferInsert[] = [];
                for (const { text } of deck.sentences) {
                    s.push({
                        id: nanoid(),
                        deckId: deckId,
                        text: text,
                    });
                }
                promises.push(tx.insert(schema.sentences).values(s));

                if (deck.type === 'SELECT') {
                    const o: typeof schema.options.$inferInsert[] = [];
                    const half = Math.floor(deck.options.length / 2);
                    for (const { text } of deck.options.slice(0, half)) {
                        o.push({
                            id: nanoid(),
                            deckId: deckId,
                            text: text,
                        });
                    }
                    promises.push(tx.insert(schema.options).values(o));
                    o.length = 0;
                    for (const { text } of deck.options.slice(half)) {
                        o.push({
                            id: nanoid(),
                            deckId: deckId,
                            text: text,
                        });
                    }
                    promises.push(tx.insert(schema.options).values(o));
                }

                await Promise.all(promises);
            })
        );
    });

    console['info']("✅ Seeding complete");
}

main().catch((e) => {
    console['error'](e);
});
