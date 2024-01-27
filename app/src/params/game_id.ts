import type { ParamMatcher } from '@sveltejs/kit';

// regex for matchiong crypto.randomUUID()
const game_id_regex = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i

export const match: ParamMatcher = (param) => {
    return game_id_regex.test(param);
};
