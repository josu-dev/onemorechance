import type { PageServerLoad } from './$types';


export const ssr = false;

export const load: PageServerLoad = async ({ locals }) => {
    return {
        userId: locals.userId,
        name: locals.name,
    };
};
