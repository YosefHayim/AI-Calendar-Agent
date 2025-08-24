import validator from 'validator';
import { z } from 'zod';

/* ---- Helpers (primitive only; no transforms to keep JSON Schema simple) ---- */
const emailSchema = z.string().refine((v) => validator.isEmail(v), { message: 'Invalid email address.' });

/* Factory: create a fresh time object per use to avoid $ref reuse */
const makeEventTime = () =>
  z.object({
    // Provide either date OR dateTime. Keep both nullable at the schema level;
    // enforce mutual exclusivity in code if you want.
    date: z.string().nullable(),
    dateTime: z.string().nullable(),
    timeZone: z.string(), // required
  });

/* Fresh full event container */
const makeFullEventParams = () =>
  z.object({
    calendarId: z.string().nullable(), // default to 'primary' in your execute layer
    summary: z.string(),
    description: z.string().nullable(),
    location: z.string().nullable(),
    start: makeEventTime(),
    end: makeEventTime(),
  });

export const PARAMETERS_TOOLS = {
  /* validate user in DB */
  validateUserDbParameter: z.object({ email: emailSchema }).describe('Validate user by email.'),

  /* list events for user (your GET returns a list) */
  getEventParameters: z.object({ email: emailSchema }).describe('Fetch events for the user email.'),

  /* list calendar types for user */
  getCalendarTypesByEventParameters: z.object({ email: emailSchema }).describe('Fetch all calendars for the user.'),

  /* insert event: nested full payload + email */
  insertEventParameters: makeFullEventParams().extend({ email: emailSchema }).describe('Insert a new event into the user calendar.'),

  /* update event: require eventId + nested payload + email */
  updateEventParameters: makeFullEventParams()
    .extend({
      eventId: z.string(),
      email: emailSchema,
    })
    .describe('Update an existing event by ID.'),

  /* delete event: eventId + email */
  deleteEventParameter: z
    .object({
      eventId: z.string(),
      email: emailSchema,
    })
    .describe('Delete an event by ID.'),

  /* normalize event payload (if you keep this tool) */
  normalizedEventParams: makeFullEventParams().extend({ email: emailSchema }).describe('Normalize an event payload for insertion/update.'),
};
