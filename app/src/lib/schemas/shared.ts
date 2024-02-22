import { z } from 'zod';


export const deleteSchema = z.object({
    id: z.string(),
    confirm: z.boolean(),
});

export const downloadSchema = z.object({
    id: z.string(),
});

export const fileSchema = z.object({
    file: z
        .custom<File>((f) => f instanceof File, 'Please upload a file.')
        .refine((f) => f.size < 100_000, 'Max 100 kB upload size.')
});

/**
 * The resultant schema must be parsed with `parseAsync` or `safeParseAsync` to work.
 */
export function fromJsonFileSchema<T>(schema: z.Schema<T>) {
    return z.preprocess(
        async (f, ctx) => {
            if (!(f instanceof File)) {
                ctx.addIssue({ fatal: true, code: 'custom' });
                return z.NEVER;
            }

            const text = await f.text();
            if (!text) {
                ctx.addIssue({ fatal: true, code: 'custom' });
                return z.NEVER;
            }

            try {
                return JSON.parse(text);
            } catch (e) {
                ctx.addIssue({ fatal: true, code: 'custom' });
                return z.NEVER;
            }
        },
        schema
    );
}
