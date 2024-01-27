import type { PageServerLoad } from './$types';


export const load: PageServerLoad = async ({locals}) => {
    console.log(locals.wss)
    locals.wss?.clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(`Hello from the load handler at ${new Date().toLocaleString()}`);
        }
    });
};
