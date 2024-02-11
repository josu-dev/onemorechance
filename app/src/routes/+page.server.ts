import { GAME } from '$shared/configs.js';
import { accountDeleteSchema, accountRegisterSchema } from '$lib/schemas/account.js';
import { roomCreateSchema, roomJoinSchema } from '$lib/schemas/room.js';
import { rooms, users } from '$lib/server/db.js';
import { redirectIfParam, uniqueRoomId } from '$lib/utils/index.js';
import { fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { zod } from 'sveltekit-superforms/adapters';
import { message, setError, superValidate, } from 'sveltekit-superforms/server';
import type { Actions, PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ locals, url }) => {
    if (locals.user) {
        redirectIfParam(url);
    }

    const registerForm = await superValidate(zod(accountRegisterSchema));
    const deleteForm = await superValidate(zod(accountDeleteSchema));

    return {
        user: locals.user,
        registerForm: registerForm,
        deleteForm: deleteForm,
        createRoomForm: await superValidate(zod(roomCreateSchema)),
    };
};

export const actions: Actions = {
    account_register: async ({ cookies, locals, request, url }) => {
        const form = await superValidate(request, zod(accountRegisterSchema));
        if (locals.user) {
            return setError(form, '', 'Ya tienes una cuenta.');
        }
        if (!form.valid) {
            return fail(400, { form });
        }

        const user = await locals.db.insert(users).values({
            id: nanoid(),
            name: form.data.name,
        }).returning().get();

        cookies.set('userId', user.id, { path: '/' });

        redirectIfParam(url);

        return message(form, { user: user });
    },
    account_delete: async ({ cookies, locals, request }) => {
        const form = await superValidate(request, zod(accountDeleteSchema));
        if (!form.valid) {
            return fail(400, { form });
        }
        if (!locals.user) {
            return setError(form, '', 'No tienes una cuenta.');
        }
        if (!form.data.confirm) {
            return setError(form, '', 'Debes confirmar que quieres eliminar tu cuenta.');
        }

        const deletedIds = await locals.db.delete(users).where(eq(users.id, locals.user.id)).returning({ id: users.id });

        cookies.delete('userId', { path: '/' });

        if (deletedIds.length < 1) {
            return setError(form, '', 'Tu usuario no existe o ya fue eliminado.', { status: 404 });
        }

        return { form };
    },
    room_create: async ({ locals, request }) => {
        const form = await superValidate(request, zod(roomCreateSchema));
        if (!locals.user) {
            return setError(form, '', 'Debes iniciar sesión para crear una sala.');
        }

        const room = await locals.db.insert(rooms).values({
            id: nanoid(),
            name: uniqueRoomId(),
            hostId: locals.user.id,
            playersMax: GAME.DEFAULT_PLAYERS,
        }).returning({ id: rooms.id }).get();

        return message(form, { room });
    },
    room_join: async ({ locals, request }) => {
        const form = await superValidate(request, zod(roomJoinSchema));
        if (!locals.user) {
            return setError(form, '', 'Debes iniciar sesión para unirte a una sala.');
        }

        const room = await locals.db.select().from(rooms).where(eq(rooms.id, form.data.id)).get();

        if (!room) {
            return setError(form, '', 'La sala no existe.', { status: 404 });
        }
        if (room.status === "CLOSED") {
            return setError(form, '', 'La sala está cerrada.');
        }
        if (room.playersCount >= room.playersMax) {
            return setError(form, '', 'La sala está llena.');
        }

        return message(form, { room });
    }
};
