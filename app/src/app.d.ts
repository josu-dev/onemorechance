declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            db: import('$lib/server/db').DB;
            user?: {
                id: string;
                name: string;
            };
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export { };
