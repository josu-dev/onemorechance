import { z } from 'zod';

export const deleteSchema = z.object({
    id: z.string(),
    confirm: z.boolean(),
});
