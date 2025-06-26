import { z } from 'zod';

export const calenderRequestSchema = z.object({
  anyoneCanAddSelf: z.boolean().nullable(),
  calendarId: z.string().nullable(),
  conferenceDataVersion: z.number().nullable(),
  maxAttendees: z.number().nullable(),
  sendNotifications: z.boolean().nullable(),
  sendUpdates: z.enum(['all', 'externalOnly', 'none']).nullable(),
  supportsAttachments: z.boolean().nullable(),
  requestBody: z
    .object({
      anyoneCanAddSelf: z.boolean().nullable(),
      attendees: z
        .array(
          z.object({
            additionalGuests: z.number().nullable(),
            comment: z.string().nullable(),
            displayName: z.string().nullable(),
            email: z.string().email().nullable(),
            id: z.string().nullable(),
            optional: z.boolean().nullable(),
            organizer: z.boolean().nullable(),
            resource: z.boolean().nullable(),
            responseStatus: z.enum(['needsAction', 'declined', 'tentative', 'accepted']).nullable(),
            self: z.boolean().nullable(),
          }),
        )
        .nullable(),
    })
    .nullable(),
  attendeesOmitted: z.boolean().nullable(),
  colorId: z.string().nullable(),
  conferenceData: z.object({}).nullable(),
  created: z.string().datetime().nullable(),
  creator: z
    .object({
      displayName: z.string().nullable(),
      email: z.string().email().nullable(),
      id: z.string().nullable(),
      self: z.boolean().nullable(),
    })
    .nullable(),
  description: z.string().nullable(),
  end: z.object({}).nullable(),
  etag: z.enum(['default', 'outOfOffice', 'focusTime']),
  eventType: z.string().nullable(),
  extendedProperties: z
    .object({
      private: z.record(z.string()).nullable(),
      shared: z.record(z.string()).nullable(),
    })
    .nullable(),
  gadget: z
    .object({
      display: z.string().nullable(),
      height: z.number().nullable(),
      iconLink: z.string().nullable(),
      link: z.string().nullable(),
      preferences: z.record(z.string()).nullable(),
      title: z.string().nullable(),
      type: z.string().nullable(),
      width: z.number().nullable(),
    })
    .nullable(),
  guestsCanInviteOthers: z.boolean().nullable(),
  guestsCanModify: z.boolean().nullable(),
  guestsCanSeeOtherGuests: z.boolean().nullable(),
  hangoutLink: z.string().nullable(),
  htmlLink: z.string().nullable(),
  iCalUID: z.string().nullable(),
  id: z.string().nullable(),
  kind: z.string().nullable(),
  location: z.string().nullable(),
  locked: z.boolean().nullable(),
  organizer: z
    .object({
      displayName: z.string().nullable(),
      email: z.string().email().nullable(),
      id: z.string().nullable(),
      self: z.boolean().nullable(),
    })
    .nullable(),
  originalStartTime: z
    .object({
      date: z.string().datetime().nullable(),
      dateTime: z.string().datetime().nullable(),
      timeZone: z.string().nullable(),
    })
    .nullable(),
  privateCopy: z.boolean().nullable(),
  recurrence: z.array(z.string()).nullable(),
  recurringEventId: z.string().nullable(),
  reminders: z
    .object({
      overrides: z
        .array(
          z.object({
            method: z.enum(['email', 'popup', 'sms']).nullable(),
            minutes: z.number().nullable(),
          }),
        )
        .nullable(),
      useDefault: z.boolean().nullable(),
    })
    .nullable(),
  sequence: z.number().nullable(),
  source: z
    .object({
      title: z.string().nullable(),
      url: z.string().nullable(),
    })
    .nullable(),
  start: z.object({}).nullable(),
  status: z.enum(['confirmed', 'cancelled', 'tentative']).nullable(),
  summary: z.string().nullable(),
  transparency: z.enum(['opaque', 'transparent']).nullable(),
  updated: z.string().datetime().nullable(),
  visibility: z.enum(['default', 'public', 'private', 'confidential']).nullable(),
});
