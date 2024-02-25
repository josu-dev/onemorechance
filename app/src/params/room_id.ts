import type { ParamMatcher } from '@sveltejs/kit';

/**
 * Matches a room identifier, which is a 6-character alphanumeric string.
 */
const roomIdRegex = /^[0-9A-Za-z]{6}$/;

export const match: ParamMatcher = (param) => {
    return roomIdRegex.test(param);
};
