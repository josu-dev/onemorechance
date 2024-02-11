import { redirect } from '@sveltejs/kit';
import { customRandom, nanoid, random } from 'nanoid';


export const uniqueId = nanoid;

export const uniqueRoomId = customRandom('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 6, random);

export function redirectToRegister(
    url: URL,
    message = ''
) {
    const redirectTo = url.pathname + url.search;
    redirect(302, `/?redirect_to=${redirectTo}&message=${encodeURIComponent(message)}`);
}

export function redirectIfParam(
    url: URL,
) {
    const redirectTo = url.searchParams.get('redirect_to');
    if (redirectTo) {
        redirect(302, `/${redirectTo.trim().slice(1)}`);
    }
}
