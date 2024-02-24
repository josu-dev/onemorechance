declare global {
    namespace App {
        interface Error {
            id?: string;
            message?: string;
            friendly?: string;
        }

        interface Locals {
            db: import('$lib/server/db').Database;
            user?: import('$shared/types.js').User;
        }

        interface PageData {
            user?: import('$shared/types.js').User;
        }

        // interface Platform {}
    }
}

export { };
