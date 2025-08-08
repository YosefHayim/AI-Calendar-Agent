import z from "zod";

const eventTimeParameters = z.object({
  date: z.string(),
  dateTime: z.string(),
  timeZone: z.string(),
});

const fullEventParameters = z.object({
  summary: z.string(),
  description: z.string(),
  location: z.string(),
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

export const VALIDATE_USER_PARAMETERS = z.object({
  email: z.string().email(),
});
