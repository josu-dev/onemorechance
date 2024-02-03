import { uniqueLettersId } from '$lib/utils/index.js';
import { fail } from '@sveltejs/kit';
import { message, superValidate, } from 'sveltekit-superforms/server';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';


const signInSchema = z.object({
    name: z.string().trim().min(3, 'Minimo de 3 caracteres').max(24, 'Maximo de 24 caracteres'),
});

const signOutSchema = z.object({
    confirm: z.boolean(),
});


export const load: PageServerLoad = async ({ locals }) => {
    const signUpForm = await superValidate(signInSchema);
    const signOutForm = await superValidate(signOutSchema);

    return {
        user: locals.user,
        signUpForm,
        signOutForm,
    };
};


export const actions: Actions = {
    signIn: async ({ request, cookies }) => {
        const form = await superValidate(request, signInSchema);
        if (!form.valid) {
            return fail(400, { form });
        }

        const user = {
            id: uniqueLettersId(),
            name: form.data.name,
        };
        cookies.set('userId', user.id, { path: '/' });
        cookies.set('name', user.name, { path: '/' });

        return message(form, { user: user });
    },
    signOut: async ({ request, cookies }) => {
        const form = await superValidate(request, signOutSchema);
        if (!form.valid) {
            return fail(400, { form });
        }
        if (!form.data.confirm) {
            return fail(400, { form });
        }

        cookies.delete('userId', { path: '/' });
        cookies.delete('name', { path: '/' });

        return message(form, { user: null });
    }
};
