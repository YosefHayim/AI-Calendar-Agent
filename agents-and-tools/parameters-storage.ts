import { z } from 'zod';

// Dynamic default function for "now" and "1 hour later"
const getStartDate = () => new Date();
const getEndDate = () => new Date(Date.now() + 3600 * 1000); // 1 hour later

export const CalenderRequestInsertSchema = z.object({
  calendarId: z.string().default('primary'),
  conferenceDataVersion: z.number().nullable().default(1),
  maxAttendees: z.number().nullable().default(3),
  sendNotifications: z.boolean().nullable().default(null),
  supportsAttachments: z.boolean().nullable().default(true),
  summary: z.string(),
  description: z.string().nullable().default(null),
  start: z.object({
    dateTime: z.string().default(() => getStartDate().toISOString()),
    timeZone: z.string().default('Asia/Jerusalem'),
  }),
  end: z.object({
    dateTime: z.string().default(() => getEndDate().toISOString()),
    timeZone: z.string().default('Asia/Jerusalem'),
  }),
});
