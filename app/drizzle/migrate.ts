import { createClient } from '@libsql/client';
import * as dotenv from "dotenv";
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

dotenv.config({ path: ".env.local" });

export const client = createClient({
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_DB_AUTH_TOKEN!
});

export const db = drizzle(client);

async function main() {
    try {
        await migrate(db, {
            migrationsFolder: 'drizzle/migrations'
        });
        console.log('Tables migrated! 🎉');
        process.exit(0);
    } catch (error) {
        console.error('Error performing migration: ', error);
        process.exit(1);
    }
}

main();
