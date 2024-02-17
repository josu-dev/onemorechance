declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            db: import('$lib/server/db').Database;
            user?: import('$shared/types.js').User;
        }
        interface PageData {
            user?: import('$shared/types.js').User;
        }
        // interface Platform {}
    }

    namespace NodeJS {
        interface ProcessEnv {
            SK_LOG_LEVEL?: string;
            SK_LOG_LEVEL_CLIENT?: string;
        }
    }
}

export { };
