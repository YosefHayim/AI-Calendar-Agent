import validator from 'validator';
import { z } from 'zod';

const emailSchema = z.string().refine((v) => validator.isEmail(v), { message: 'Invalid email address.' });

const makeEventTime = () =>
  z.object({
    date: z
      .string({
        description: 'The date, in the format "yyyy-mm-dd", if this is an all-day event.',
        invalid_type_error: 'Invalid date format.',
        message: 'Invalid date format.',
      })
      .nullable(),
    dateTime: z
      .string({
        coerce: true,
        description:
          'The time, as a combined date-time value (formatted according to RFC3339). A time zone offset is required unless a time zone is explicitly specified in timeZone.',
        invalid_type_error: 'Invalid date-time format.',
        message: 'Invalid date-time format.',
      })
      .nullable(),
    timeZone: z
      .string({
        coerce: true,
        invalid_type_error: 'Must be a valid IANA Time Zone Database name.',
        message: 'Must be a valid IANA Time Zone Database name.',
        description: 'The time zone in which the time is specified. (Formatted as an IANA Time Zone Database name, e.g. "Asia/Jerusalem".) ',
      })
      .nullable(),
  });

const makeFullEventParams = () =>
  z.object({
    calendarId: z.string({ description: 'The ID of the calendar to which the event belongs.', coerce: true }).nullable(),
    summary: z.string({ description: 'Title of the event.', coerce: true }),
    description: z.string({ description: 'Description of the event.', coerce: true }).nullable(),
    location: z.string({ description: 'Geographic location of the event.', coerce: true }).nullable(),
    start: makeEventTime(),
    end: makeEventTime(),
  });

export const PARAMETERS_TOOLS = {
  // need to finish this properly the register via db
  validateUserDbParametersToRegisterUser: z.object({ email: emailSchema }).describe('Register user to our db.'),
  validateUserDbParameter: z.object({ email: emailSchema }).describe('Validate user by email.'),
  getUserDefaultTimeZone: z.object({ email: emailSchema }).describe('Fetch user default timezone.'),
  getEventParameters: z
    .object({
      email: emailSchema,
      timeMin: z.string().nullable(),
      q: z
        .string({
          description: 'Optional parameter to search for text matches across all event fields in Google Calendar.',
        })
        .nullable(),
    })
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
