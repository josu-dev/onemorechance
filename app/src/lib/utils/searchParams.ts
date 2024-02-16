import { z } from 'zod';


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
