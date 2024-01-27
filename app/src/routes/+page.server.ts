import { error, type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createUser } from '$lib/server/users';
import { nanoid } from 'nanoid';
import { createRoom, joinRoom } from '$lib/server/rooms';


export const load: PageServerLoad = async ({locals}) => {
    return {
        user: locals.user,
    }
};


export const actions: Actions = {
    register_name: async ({ request, cookies, locals }) => {
        console.log('register_name');
        const data = await request.formData();
        const name = data.get('name');
        if (!name || typeof name !== 'string') {
            error(400, 'Missing name');
        }

        const userId = nanoid();
        cookies.set('name', name, { path: '/' });
        cookies.set('userId', userId, { path: '/' });
        
        const user = await createUser(userId, name);
        return user;
    },
    create_room: async ({ request, locals }) => {
        if (!locals.user) {
            error(400, 'Missing user');
        }

        const room = await createRoom(locals.user)
        
        redirect(302, `/${room.id}`);
    },
    join_room: async ({ request, locals }) => {
        if (!locals.user) {
            error(400, 'Missing user');
        }
        
        const data = await request.formData();
        const room_id = data.get('room_id');
        if (!room_id || typeof room_id !== 'string') {
            error(400, 'Missing room_id');
        }

        const room = await joinRoom(room_id, locals.user)
        if (!room) {
            error(404, 'Room not found');
        }

        locals.wss?.clients.forEach(client => {
            if (client.socketId === locals.sswsId) {
                client.metadata.roomId = room.id;
            }
        });
        
        redirect(302, `/${room.id}`);
    }
};
