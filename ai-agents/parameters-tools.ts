import validator from 'validator';
import z from 'zod';

const eventTimeParameters = z.object({
  date: z.string().describe('The date of the event in YYYY-MM-DD format.').nullable(),
  dateTime: z.string().describe('The date and time of the event in RFC3339 format.'),
  timeZone: z.string().describe('The time zone of the event, e.g., "America/Los_Angeles".'),
});

const eventParameters = z.object({
  summary: z.string().describe('The title of the event.'),
  description: z.string().describe('A detailed description of the event.'),
  location: z.string().describe('The physical location or a meeting link for the event.'),
  start: eventTimeParameters.describe('The start time and date of the event.'),
  end: eventTimeParameters.describe('The end time and date of the event.'),
});

const fullEventParameters = z.object({
  calendarId: z.string().nullable().default('primary'),
  eventParameters,
});

export const PARAMETERS_TOOLS = {
  getCalendarTypesByEventParameters: z
    .object({
      email: z.string({ description: 'Unique identifier for the user. Email address is a must.' }),
    })
    .extend({ eventParameters }),

  getEventParameters: z
    .object({
      email: z
        .string({ description: 'Unique identifier for the user. Email address is a must.' })
        .refine((value) => validator.isEmail(value), {
          message: 'Invalid email address.',
        })
        .describe('The email address of the user to validate.'),
    })
    .describe('Parameters for retrieving an event.'),
  eventTypeToolParameters: z
    .object({
      email: z.string({ description: 'Unique identifier for the user. Email address is a must.' }).refine((value) => validator.isEmail(value), {
        message: 'Invalid email address.',
      }),
    })
    .describe('Parameters for determining event type.'),
  validateUserDbParameter: z
    .object({
      email: z
        .string({ description: 'Unique identifier for the user. Email address is a must.' })
        .refine((value) => validator.isEmail(value), {
          message: 'Invalid email address.',
        })
        .describe('The email address of the user to validate.'),
    })
    .describe('Parameter for validating a user in the database.'),
  deleteEventParameter: z
    .object({
      eventId: z.string().describe('The unique ID of the event to be deleted.'),
    })
    .extend({
      email: z
        .string({ description: 'Unique identifier for the user. Email address is a must.' })
        .refine((value) => validator.isEmail(value), {
          message: 'Invalid email address.',
        })
        .describe('The email address of the user to validate.'),
    })
    .describe('Parameter for deleting an event.'),
  insertEventParameters: fullEventParameters
    .extend({
      email: z
        .string()
        .refine((value) => validator.isEmail(value), { message: 'Invalid email address.' })
        .describe('The email address of the user to use for insertion of the event into the user calendar.'),
    })
    .describe('Parameters for inserting new event into user calendar.'),
  updateEventParameters: fullEventParameters
    .extend({
      email: z
        .string()
        .refine((value) => validator.isEmail(value), { message: 'Invalid email address.' })
        .describe('The email address of the user to validate.'),
    })
    .describe('Parameters for updating an existing event.'),
  normalizedEventParams: fullEventParameters.extend({
    email: z
      .string()
      .refine((value) => validator.isEmail(value), { message: 'Invalid email address.' })
      .describe('The email address for the tokens to access user calendar tokens validate.'),
  }),
};
