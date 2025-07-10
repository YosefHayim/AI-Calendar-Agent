import z from "zod";

export const insertEventParameters = z.object({
  summary: z.string(),
  description: z.string(),
  start: z.object({
    dateTime: z.string(),
    timeZone: z.string().default("Asia/Jerusalem"),
  }),
  end: z.object({
    dateTime: z.string(),
    timeZone: z.string().default("Asia/Jerusalem"),
  }),
});
