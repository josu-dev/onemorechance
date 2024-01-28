import type { ParamMatcher } from '@sveltejs/kit';


const roomIdRegex = /^[0-9A-Za-z]{6}$/;

export const match: ParamMatcher = (param) => {
    return roomIdRegex.test(param);
};
