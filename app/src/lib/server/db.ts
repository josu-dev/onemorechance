import { TURSO_DB_AUTH_TOKEN, TURSO_DB_URL } from '$env/static/private';
import { createClient } from "@libsql/client";
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import { drizzle } from "drizzle-orm/libsql";
import { schema } from '../../../drizzle/schema.js';

export type DB = LibSQLDatabase<typeof schema>;

function tursoClient(): DB {
  const turso = createClient({
    url: TURSO_DB_URL,
    authToken: TURSO_DB_AUTH_TOKEN
  });

  return drizzle(
    turso,
    { schema }
  );
}

export const db = tursoClient();

export {
  decks,
  deckRelations,
  sentences,
  sentenceRelations,
  options,
  optionRelations,
} from '../../../drizzle/schema.js'