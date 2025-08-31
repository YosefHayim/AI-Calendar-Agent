import validator from 'validator';
import { z } from 'zod';

const emailSchema = z.string().refine((v) => validator.isEmail(v), { message: 'Invalid email address.' });

const makeEventTime = () =>
  z.object({
    date: z.string().nullable(),
    dateTime: z.string().nullable(),
    timeZone: z.string(),
  });

const makeFullEventParams = () =>
  z.object({
    calendarId: z.string().nullable(),
    summary: z.string(),
    description: z.string().nullable(),
    location: z.string().nullable(),
    start: makeEventTime(),
    end: makeEventTime(),
  });

export const PARAMETERS_TOOLS = {
  // need to finish this properly the register via db
  validateUserDbParametersToRegisterUser: z.object({ email: emailSchema }).describe('Register user to our db.'),
  validateUserDbParameter: z.object({ email: emailSchema }).describe('Validate user by email.'),
  getUserDefaultTimeZone: z.object({ email: emailSchema }).describe('Fetch user default timezone.'),
  getEventParameters: z
    .object({ email: emailSchema, timeMin: z.string().nullable() })
    .describe('Fetch events for the user email for the maximum date of time provided.'),
  getCalendarTypesByEventParameters: z.object({ email: emailSchema }).describe('Fetch all calendars for the user.'),
  insertEventParameters: makeFullEventParams().extend({ email: emailSchema }).describe('Insert a new event into the user calendar.'),
  updateEventParameters: makeFullEventParams()
    .extend({
      eventId: z.string(),
      email: emailSchema,
    })
    .describe('Update an existing event by ID.'),
  deleteEventParameter: z
    .object({
      eventId: z.string(),
      email: emailSchema,
    })
    .describe('Delete an event by ID.'),
  normalizedEventParams: makeFullEventParams().extend({ email: emailSchema }).describe('Normalize an event payload for insertion/update.'),
};
