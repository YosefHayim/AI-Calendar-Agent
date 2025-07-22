import { Timezone } from "../../types";
import z from "zod";

export const updateEventParameters = z.object({
  summary: z.string(),
  description: z.string(),
  start: z.object({
    dateTime: z.string(),
    timeZone: z.string().default(Timezone.ASIA_JERUSALEM),
  }),
  end: z.object({
    dateTime: z.string(),
    timeZone: z.string().default(Timezone.ASIA_JERUSALEM),
  }),
});
