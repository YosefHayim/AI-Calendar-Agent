import * as z from 'zod/v4';

import { Agent, tool } from '@openai/agents';
import { calendar, requestConfigBase } from '../../config/oauth-config';

import { GaxiosPromise } from 'googleapis/build/src/apis/abusiveexperiencereport';
import { calendar_v3 } from 'googleapis';

const CalendarInsertEventSchema = z.object({
  anyoneCanAddSelf: z.boolean().optional(),
  calendarId: z.string().optional(),
  conferenceDataVersion: z.number().optional(),
  maxAttendees: z.number().optional(),
  sendNotifications: z.boolean().optional(),
  sendUpdates: z.enum(['all', 'externalOnly', 'none']).optional(),
  supportsAttachments: z.boolean().optional(),
  requestBody: z.object({
    anyoneCanAddSelf: z.boolean().optional(),
    attendees: z.array(
      z.object({
        additionalGuests: z.number().optional(),
        comment: z.string().optional(),
        displayName: z.string().optional(),
        email: z.string().email().optional(),
        id: z.string().optional(),
        optional: z.boolean().optional(),
        organizer: z.boolean().optional(),
        resource: z.boolean().optional(),
        responseStatus: z.enum(['needsAction', 'declined', 'tentative', 'accepted']).optional(),
        self: z.boolean().optional(),
      }),
    ),
  }),
  attendeesOmitted: z.boolean().optional(),
  colorId: z.string().optional(),
  conferenceData: z.object({}),
  created: z.iso.datetime().optional(),
  creator: z.object({
    displayName: z.string().optional(),
    email: z.email().optional(),
    id: z.string().optional(),
    self: z.boolean().optional(),
  }),
  description: z.string().optional(),
  end: z.object({}),
  etag: z.enum(['default', 'outOfOffice', 'focusTime']),
  eventType: z.string().optional(),
  extendedProperties: z
    .object({
      private: z.record(z.string(), z.string()).optional(),
      shared: z.record(z.string(), z.string()).optional(),
    })
    .optional(),
  gadget: z.object({
    display: z.string().optional(),
    height: z.number().optional(),
    iconLink: z.string().optional(),
    link: z.string().optional(),
    preferences: z.record(z.string(), z.string()).optional(),
    title: z.string().optional(),
    type: z.string().optional(),
    width: z.number().optional(),
  }),
  guestsCanInviteOthers: z.boolean().optional,
  guestsCanModify: z.boolean().optional(),
  guestsCanSeeOtherGuests: z.boolean().optional(),
  hangoutLink: z.string().optional(),
  htmlLink: z.string().optional(),
  iCalUID: z.string().optional(),
  id: z.string().optional(),
  kind: z.string().optional(),
  location: z.string().optional(),
  locked: z.boolean().optional(),
  organizer: z.object({
    displayName: z.string().optional(),
    email: z.string() && z.email().optional(),
    id: z.string().optional(),
    self: z.boolean().optional(),
  }),
  originalStartTime: z
    .object({
      date: z.iso.datetime().optional(),
      dateTime: z.iso.datetime().optional(),
      timeZone: z.string().optional(),
    })
    .optional(),
  privateCopy: z.boolean().optional(),
  recurrence: z.array(z.string()).optional(),
  recurringEventId: z.string().optional(),
  reminders: z
    .object({
      overrides: z
        .array(
          z.object({
            method: z.enum(['email', 'popup', 'sms']).optional(),
            minutes: z.number().optional(),
          }),
        )
        .optional(),
      useDefault: z.boolean().optional(),
    })
    .optional(),
  sequence: z.number().optional(),
  source: z
    .object({
      title: z.string().optional(),
      url: z.string().optional(),
    })
    .optional(),
  start: z.object({}),
  status: z.enum(['confirmed', 'cancelled', 'tentative']).optional(),
  summary: z.string().optional(),
  transparency: z.enum(['opaque', 'transparent']).optional(),
  updated: z.iso.datetime().optional(),
  visibility: z.enum(['default', 'public', 'private', 'confidential']).optional(),
});

const insertEvent = async (eventData: calendar_v3.Params$Resource$Events$Insert): GaxiosPromise => {
  try {
    const response = await calendar.events.insert({ ...requestConfigBase, ...eventData });
    return response;
  } catch (error) {
    console.log('Failed to insert event by agent.:', error);
    throw new Error('Failed to insert event by agent.');
  }
};

const insertEventTool = tool({
  name: 'insertEvent',
  description: ' Insert an event into the calendar using the provided event data.',
  parameters: CalendarInsertEventSchema,
  execute: async (eventData) => insertEvent(eventData as calendar_v3.Params$Resource$Events$Insert),
});

export const createEventAgent = new Agent({
  name: 'Create Event Agent',
  model: 'gpt-4',
  instructions:
    'You are an agent that helps users insert events into their user calendar. When a user asks to add, insert, or schedule an event, you will handle the request.',
  outputType: 'text',
  toolUseBehavior: 'run_llm_again',
  tools: [insertEventTool],
});
