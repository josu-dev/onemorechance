import { accountDeleteSchema, accountRegisterSchema } from '$lib/schemas/account.js';
import { roomCreateSchema, roomJoinSchema } from '$lib/schemas/room.js';
import { rooms, users, usersToRooms } from '$lib/server/db.js';
import { getRedirectTo, log, redirectIfParam } from '$lib/server/utils.ts';
import { isRoomId, uniqueRoomId } from '$lib/utils/index.js';
import { ROOM_STATUS } from '$shared/constants.ts';
import { GAME } from '$shared/defaults.js';
import { fail, redirect } from '@sveltejs/kit';
import { eq, sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { message, setError, superValidate, } from 'sveltekit-superforms';
import { zod } from 'sveltekit-superforms/adapters';
import type { Actions, PageServerLoad } from './$types';


export const load: PageServerLoad = async ({ locals, url }) => {
    if (locals.user) {
        redirectIfParam(url);
    }

    const [
        registerForm,
        roomCreateForm, roomJoinForm,
    ] = await Promise.all([
        superValidate(zod(accountRegisterSchema)),
        superValidate(zod(roomCreateSchema)),
        superValidate(zod(roomJoinSchema)),
    ]);

    return {
        account: {
            registerForm: registerForm,
        },
        room: {
            createForm: roomCreateForm,
            joinForm: roomJoinForm,
        },
    };
};

export const actions: Actions = {
    account_register: async ({ cookies, locals, request, url }) => {
        const form = await superValidate(request, zod(accountRegisterSchema));
        if (locals.user) {
            return setError(form, '', 'Ya tienes una cuenta');
        }
        if (!form.valid) {
            return fail(400, { form });
        }

        const user = await (locals.db
            .insert(users)
            .values({
                id: nanoid(),
                name: form.data.name,
            })
            .returning()
            .get()
        );

        cookies.set('userId', user.id, { path: '/' });
        form.message = { user: user };

        const redirectTo = getRedirectTo(url);
        if (!redirectTo || !redirectTo.startsWith('/r/')) {
            return { form };
        }
        const roomId = redirectTo.slice(3);
        if (!isRoomId(roomId)) {
            return { form };
        }

        const room = await (locals.db
            .select({
                id: rooms.id,
                status: rooms.status,
                playersCount: sql<number>`(select count(*) from ${usersToRooms} where ${usersToRooms.roomId} = ${rooms.id})`,
                playersMax: rooms.playersMax
            })
            .from(rooms)
            .where(eq(rooms.id, roomId))
            .get()
        );
        if (!room) {
            return setError(form, '', 'La sala no existe', { status: 404 });
        }
        if (room.status === ROOM_STATUS.CLOSED) {
            return setError(form, '', 'La sala esta cerrada');
        }
        if (room.playersCount >= room.playersMax) {
            return setError(form, '', 'La sala esta llena');
        }

        await locals.db.insert(usersToRooms).values({
            userId: user.id,
            roomId: room.id,
        });

        redirect(302, redirectTo);
    },
    account_delete: async ({ cookies, locals, request }) => {
        const form = await superValidate(request, zod(accountDeleteSchema));
        if (!form.valid) {
            return fail(400, { form });
        }
        if (!locals.user) {
            return setError(form, '', 'No tienes una cuenta');
        }
        if (!form.data.confirm) {
            return setError(form, '', 'Debes confirmar que quieres eliminar tu cuenta');
        }

        const deleted = await locals.db.delete(users).where(eq(users.id, locals.user.id)).returning({ id: users.id }).get();

        cookies.delete('userId', { path: '/' });

        if (!deleted) {
            log.debug('User not found when deleting account', { user: locals.user });
            return { form };
        }

        return { form };
    },
    room_create: async ({ locals, request }) => {
        const form = await superValidate(request, zod(roomCreateSchema));
        if (!locals.user) {
            return setError(form, '', 'Debes iniciar sesion para crear una sala');
        }

        const room = await locals.db.insert(rooms).values({
            id: uniqueRoomId(),
            name: uniqueRoomId(),
            hostId: locals.user.id,
            playersMax: GAME.MAX_PLAYERS,
        }).returning({ id: rooms.id }).get();

        await locals.db.insert(usersToRooms).values({
            userId: locals.user.id,
            roomId: room.id,
        });

        return message(form, { room });
    },
    room_join: async ({ locals, request }) => {
        const form = await superValidate(request, zod(roomJoinSchema));
        if (!locals.user) {
            return setError(form, '', 'Debes iniciar sesion para unirte a una sala');
        }

        const room = await (locals.db
            .select({
                id: rooms.id,
                status: rooms.status,
                playersCount: sql<number>`(select count(*) from ${usersToRooms} where ${usersToRooms.roomId} = ${rooms.id})`,
                playersMax: rooms.playersMax
            })
            .from(rooms)
            .where(eq(rooms.id, form.data.id))
            .get()
        );
        if (!room) {
            return setError(form, '', 'La sala no existe', { status: 404 });
        }
        if (room.status === "CLOSED") {
            return setError(form, '', 'La sala esta cerrada');
        }
        if (room.playersCount >= room.playersMax) {
            return setError(form, '', 'La sala esta llena');
        }

        await locals.db.insert(usersToRooms).values({
            userId: locals.user.id,
            roomId: room.id,
        });

        return message(form, { room });
    }
};
