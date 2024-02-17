import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

if (!process.env.TURSO_DB_URL) {
    throw new Error("TURSO_DB_URL is not set");
}
if (!process.env.TURSO_DB_AUTH_TOKEN && !process.env.TURSO_DB_URL.startsWith("file:")) {
    throw new Error("TURSO_DB_AUTH_TOKEN is not set");
}

export default {
    schema: "./drizzle/schema.ts",
    out: "./drizzle/migrations",
    driver: "turso",
    dbCredentials: {
        url: process.env.TURSO_DB_URL,
        authToken: process.env.TURSO_DB_AUTH_TOKEN,
    },
} satisfies Config;
