import { error, type Cookies } from '@sveltejs/kit';


export const randomId = {
    user() {
        return crypto.randomUUID();
    },
    room() {
        return crypto.randomUUID();
    },
}


export function cookieOrError(cookies: Cookies, key: string): string {
    const value = cookies.get(key);
    if (!value) {
        error(400, `Missing cookie ${key}`);
    }

    return value;
}
