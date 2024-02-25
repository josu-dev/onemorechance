import { z } from 'zod';
import * as s from './shared.ts';

export const roomCreateSchema = z.object({});

export const roomJoinSchema = z.object({
    id: s.roomIdSchema,
});
