import { TIMEZONE } from "../../types";
import z from "zod";

export const getEventParameters = z.object({
  summary: z.string(),
  description: z.string(),
  start: z.object({
    dateTime: z.string(),
    timeZone: z.string().default(TIMEZONE.IL),
  }),
  end: z.object({
    dateTime: z.string(),
    timeZone: z.string().default(TIMEZONE.IL),
  }),
});
