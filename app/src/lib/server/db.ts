import { env } from '$env/dynamic/private';
import { createClient } from "@libsql/client";
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { drizzle } from "drizzle-orm/libsql";
import * as schema from '../../../drizzle/schema.js';


export type TablesSchema = typeof schema;

export type Database = LibSQLDatabase<TablesSchema>;

function tursoClient(): Database {
    const turso = createClient({
        url: env.TURSO_DB_URL,
        authToken: env.TURSO_DB_AUTH_TOKEN
    });

    return drizzle(
        turso,
        { schema }
    );
}

export const db = tursoClient();

export const {
    decks,
    deckRelations,
    sentences,
    sentenceRelations,
    options,
    optionRelations,
    users,
    rooms,
    roomRelations,
} = schema;
