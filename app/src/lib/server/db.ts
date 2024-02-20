import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { createClient } from "@libsql/client";
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { drizzle } from "drizzle-orm/libsql";
import * as schema from '../../../drizzle/schema.js';


export type TablesSchema = typeof schema;

export type Database = LibSQLDatabase<TablesSchema>;

function tursoClient(): Database {
    if (building) {
        return {} as any;
    }
    if (!env.TURSO_DB_URL || !env.TURSO_DB_AUTH_TOKEN) {
        throw new Error('Missing TURSO_DB_URL or TURSO_DB_AUTH_TOKEN environment variables');
    }

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
    decksRelations,
    sentences,
    sentencesRelations,
    options,
    optionsRelations,
    users,
    rooms,
    roomsRelations,
    usersToRooms,
    usersToRoomsRelations,
} = schema;
