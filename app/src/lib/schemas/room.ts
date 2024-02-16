import { z } from 'zod';


export const roomCreateSchema = z.object({});

export const roomJoinSchema = z.object({
    id: z.string(),
});
