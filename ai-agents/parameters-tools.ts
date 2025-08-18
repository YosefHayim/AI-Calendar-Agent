import validator from 'validator';
import z from 'zod';

const eventTimeParameters = z.object({
  date: z.string().describe('The date of the event in YYYY-MM-DD format.'),
  dateTime: z.string().describe('The date and time of the event in RFC3339 format.'),
  timeZone: z.string().describe('The time zone of the event, e.g., "America/Los_Angeles".'),
});

const fullEventParameters = z.object({
  summary: z.string().describe('The title of the event.'),
  description: z.string().describe('A detailed description of the event.'),
  location: z.string().describe('The physical location or a meeting link for the event.'),
  start: eventTimeParameters.describe('The start time and date of the event.'),
  end: eventTimeParameters.describe('The end time and date of the event.'),
});

export const eventParameters = {
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
  validateUserDbParamater: z
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
        .string({ description: 'Unique identifier for the user. Email address is a must.' })
        .refine((value) => validator.isEmail(value), {
          message: 'Invalid email address.',
        })
        .describe('The email address of the user to validate.'),
    })
    .describe('Parameters for inserting a new event.'),
  updateEventParameters: fullEventParameters
    .extend({
      email: z
        .string()
        .refine((value) => validator.isEmail(value), { message: 'Invalid email address.' })
        .describe('The email address of the user to validate.'),
    })
    .describe('Parameters for updating an existing event.'),
};
