declare global {
    namespace App {
        // interface Error {}
        interface Locals {
            db: import('$lib/server/db').DB;
            user?: import('$lib/server/db').DBSchema['users']['$inferSelect'];
        }
        // interface PageData {}
        // interface Platform {}
    }
}

export { };
