import { TIMEZONE } from "../types";
import z from "zod";

const eventTimeParameters = z.object({
  dateTime: z.string(),
  TIMEZONE: z.string().default(TIMEZONE.ASIA_JERUSALEM),
});

const fullEventParameters = z.object({
  summary: z.string(),
  description: z.string(),
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
