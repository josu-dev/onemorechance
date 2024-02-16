import type { ParamMatcher } from '@sveltejs/kit';

const idRegex = /^[A-Za-z0-9_-]{21}$/;

export const match: ParamMatcher = (param) => {
    return idRegex.test(param);
};
