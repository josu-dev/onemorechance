import type { ParamMatcher } from '@sveltejs/kit';

/**
 * Matches a `nanoid` identifier, which is a 21-character alphanumeric/underscore/hyphen string.
 */
const idRegex = /^[A-Za-z0-9_-]{21}$/;

export const match: ParamMatcher = (param) => {
    return idRegex.test(param);
};
