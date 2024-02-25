import { z } from 'zod';

export const nanoIdSchema = z.string().regex(/^[\w-]{21}$/, 'Invalid id');

export const roomIdSchema = z.string().regex(/^[0-9A-Za-z]{6}$/, 'Invalid room id');

export const deleteSchema = z.object({
    id: nanoIdSchema,
    confirm: z.boolean().refine((v) => v, 'Debes confirmar la eliminacion')
});

export const downloadSchema = z.object({
    id: nanoIdSchema,
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

export function searchParamsToValues(searchParams: URLSearchParams): Record<string, unknown> {
    const res: Record<string, unknown> = {};
    for (const key of searchParams.keys()) {
        const values: unknown[] = [];
        for (const value of searchParams.getAll(key)) {
            try {
                values.push(JSON.parse(value));
            }
            catch (e) {
                if (e instanceof SyntaxError) {
                    values.push(value);
                    continue;
                }
                throw e;
            }
        }
        res[key] = values.length > 1 ? values : values[0];
    }
    return res;
}

export function makeSearchParamsSchema<
    Schema extends z.ZodObject<z.ZodRawShape>
>(schema: Schema) {
    return z.instanceof(URLSearchParams)
        .transform(searchParamsToValues)
        .pipe(schema);
}
