import { createClient } from '@libsql/client';
import * as dotenv from "dotenv";
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';

dotenv.config({ path: ".env.local" });

export const client = createClient({
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_DB_AUTH_TOKEN!
});

export const db = drizzle(client);

export async function main() {
    try {
        const tables = await db.select({ name: sql`name` }).from(sql`sqlite_master`);
        if (tables.length === 0) {
            console['log']("🚫 Database is already empty");
            process.exit(0);
        }

        console['log']("🗑️  Emptying the entire database");

        await db.transaction(async (tx) => {
            const queries: Promise<any>[] = [];
            for (const { name } of tables) {
                console['log'](`🧨 Preparing delete query for table: \`${name}\``);
                queries.push(tx.run(sql.raw(`DROP TABLE IF EXISTS ${name};`)).catch(console['error']));
            }

            console['log']("📨 Sending delete queries...");
            await Promise.all(queries);
        });

        console['log']("✅ Database emptied");
        process.exit(0);
    }
    catch (error) {
        console['error']("❌ Error while emptying the database", error);
        process.exit(1);
    }
}

main();
