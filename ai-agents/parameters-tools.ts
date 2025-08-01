import { TIMEZONE } from "../types";
import z from "zod";

const eventTimeParameters = z.object({
  date: z.string({ description: "The date of the event in YYYY-MM-DD format." }),
  dateTime: z.string({ description: "The date and time of the event in ISO 8601 format e.g. 2025-06-29T15:00:00+03:00" }),
  timeZone: z.string({ description: "The timezone of the event e.g Asia/Jerusalem" }).default(TIMEZONE.ASIA_JERUSALEM),
});

const fullEventParameters = z.object({
  summary: z.string({ description: "The summary or name of the event." }).min(3, { message: "Event summary must be at least 3 characters long." }),
  description: z.string({ description: "A description of the event." }).nullable().optional(),
  location: z.string({ description: "The location of the event." }).nullable().optional(),
  start: eventTimeParameters,
  end: eventTimeParameters,
});

export const EVENT_PARAMETERS = {
  deleteEventParameters: fullEventParameters,
  eventTypeToolParameters: z.object({}),
  getEventParameters: z.object({}),
  insertEventParameters: fullEventParameters,
  updateEventParameters: fullEventParameters,
};
