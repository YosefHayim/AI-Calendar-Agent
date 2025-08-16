import z from 'zod';

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

export const eventParameters = {
  getEventParameters: z.object({}),
  eventTypeToolParameters: z.object({}),
  validateUserDbParamater: z.object({ email: z.string() }),
  deleteEventParameter: z.object({
    eventId:z.string()
  }),
  insertEventParameters: fullEventParameters,
  updateEventParameters: fullEventParameters,
};
