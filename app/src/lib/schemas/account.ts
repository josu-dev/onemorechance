import { z } from 'zod';

export const accountRegisterSchema = z.object({
    name: z.string().trim().min(3, 'Minimo de 3 caracteres').max(24, 'Maximo de 24 caracteres'),
});

export const accountDeleteSchema = z.object({
    confirm: z.boolean(),
});
