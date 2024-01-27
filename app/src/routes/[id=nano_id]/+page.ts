import { room } from '$lib/stores/room';
import { user } from '$lib/stores/user';
import type { PageLoad } from './$types';


export const load: PageLoad = async () => {
    const isHost = user.peek?.id === room.peek?.host.id;

    return {
        isHost: isHost,
    };
};
