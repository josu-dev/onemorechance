import { createClient } from "@libsql/client";
import 'dotenv/config';
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { drizzle } from "drizzle-orm/libsql";
import * as schema from '../drizzle/schema.js';


export type TablesSchema = typeof schema;

export type Database = LibSQLDatabase<TablesSchema>;

function tursoClient(): Database {
    if (!process.env.TURSO_DB_URL || !process.env.TURSO_DB_AUTH_TOKEN) {
        throw new Error('Missing TURSO_DB_URL or TURSO_DB_AUTH_TOKEN environment variables');
    }

    const turso = createClient({
        url: process.env.TURSO_DB_URL,
        authToken: process.env.TURSO_DB_AUTH_TOKEN
    });

    return drizzle(turso, { schema });
}

export const db = tursoClient();

export const t = schema;
