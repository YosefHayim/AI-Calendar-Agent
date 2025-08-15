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

const validateUserDbParameters = z.object({
  access_token: z.string(),
  created_at: z.string().datetime(),
  email: z.string().email().nullable(),
  expiry_date: z.number(),
  id: z.number(),
  id_token: z.string().nullable(),
  is_active: z.boolean(),
  refresh_token: z.string(),
  refresh_token_expires_in: z.number(),
  scope: z.string(),
  token_type: z.string(),
});

export const eventParameters = {
  deleteEventParameters: fullEventParameters,
  eventTypeToolParameters: z.object({}),
  getEventParameters: z.object({}),
  insertEventParameters: fullEventParameters,
  updateEventParameters: fullEventParameters,
  validateUserDbParameters,
};
