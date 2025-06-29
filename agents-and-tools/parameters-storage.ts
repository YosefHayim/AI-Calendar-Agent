import { z } from 'zod';

// Dynamic default function for "now" and "1 hour later"
// const getStartDate = () => new Date();
// const getEndDate = () => new Date(Date.now() + 3600 * 1000); // 1 hour later

export const CalenderRequestInsertSchema = z.object({
  summary: z.string().default('Untitled Event'),
  location: z.string().nullable(),
  description: z.string().nullable(),
});
