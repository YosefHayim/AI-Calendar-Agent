import { z } from 'zod';

export const CalenderRequestInsertSchema = z.object({
  summary: z.string().default('Untitled Event'),
  location: z.string().nullable(),
  description: z.string().nullable(),
});
