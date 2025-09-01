import validator from 'validator';
import { z } from 'zod';
import { TIMEZONE } from '@/types';

const requiredString = (description: string, message = 'Required.') => z.coerce.string({ description }).trim().min(1, { message });

const emailSchema = z
  .string({
    description: 'The email address of the user, used for authentication and authorization via database and google calendar.',
  })
  .includes('@', { message: 'Must include @ symbol' })
  .refine((v) => validator.isEmail(v), { message: 'Invalid email address.' });

const makeEventTime = () =>
  z
    .object({
      date: z.coerce
        .string({
          description: 'The date, in the format "yyyy-mm-dd", if this is an all-day event.',
          invalid_type_error: 'Invalid date format. Example: "2025-07-17"',
          message: 'Invalid date format.',
        })
        .nullable(),
      dateTime: z.coerce
        .string({
          description:
            'The time, as a combined date-time value (formatted according to RFC3339). A time zone offset is required unless a time zone is explicitly specified in timeZone.',
          invalid_type_error: `Invalid date-time format. Example:"${new Date().toISOString()}" `,
          message: 'Invalid date-time format.',
        })
        .nullable(),
      timeZone: z.coerce
        .string({
          invalid_type_error: 'Must be a valid IANA Time Zone Database name.',
          message: `Must be a valid IANA Time Zone Database name. Example:"${TIMEZONE.ASIA_JERUSALEM}":`,
          description: 'The time zone in which the time is specified. (Formatted as an IANA Time Zone Database name, e.g. "Asia/Jerusalem".) ',
        })
        .nullable(),
    })
    .describe('Event start or end time, with optional timezone.');

const makeFullEventParams = () =>
  z
    .object({
      calendarId: z.coerce.string({ description: 'The ID of the calendar to which the event belongs.' }).nullable(),
      summary: requiredString('Title of the event.', 'Summary is required.'),
      description: z.coerce.string({ description: 'Description of the event.' }).nullable(),
      location: z.coerce.string({ description: 'Geographic location of the event.' }).nullable(),
      start: makeEventTime(),
      end: makeEventTime(),
    })
    .describe('Full event parameters including summary, description, location, start, and end times.');

export const PARAMETERS_TOOLS = {
  validateUserDbParametersToRegisterUser: z.object({ email: emailSchema }).describe('Register user to our db.'),
  validateUserDbParameter: z.object({ email: emailSchema }).describe('Validate user by email.'),
  getUserDefaultTimeZone: z.object({ email: emailSchema }).describe('Fetch user default timezone.'),
  getEventParameters: z
    .object({
      email: emailSchema,
      timeMin: z.coerce.string({ description: 'The minimum date and time for events to return, formatted as RFC3339 timestamp.' }).nullable(),
      q: z.coerce.string({ description: 'Optional parameter to search for text matches across all event fields in Google Calendar.' }).nullable(),
      customEvents: z.coerce
        .boolean({ description: 'Optional parameter whether we want to receive back custom event object or not, default to false.' })
        .nullable(),
    })
    .describe('Fetch events for the user email for the maximum date of time provided.'),

  getCalendarTypesByEventParameters: z.object({ email: emailSchema }).describe('Fetch all calendars for the user.'),
  insertEventParameters: makeFullEventParams().extend({ email: emailSchema }).describe('Insert a new event into the user calendar.'),
  updateEventParameters: makeFullEventParams()
    .extend({
      eventId: requiredString('The ID of the event to update.', 'Event ID is required.'),
      email: emailSchema,
    })
    .describe('Update an existing event by ID.'),
  deleteEventParameter: z
    .object({
      eventId: requiredString('The ID of the event to delete.', 'Event ID is required.'),
      email: emailSchema,
    })
    .describe('Delete an event by ID.'),
  normalizedEventParams: makeFullEventParams().extend({ email: emailSchema }).describe('Normalize an event payload for insertion/update.'),
};
