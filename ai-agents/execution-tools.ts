import { CALENDAR, SUPABASE } from '@/config/root-config';

import { ACTION } from '@/types';
import { TOKEN_FIELDS } from '@/utils/storage';
import { asyncHandler } from '@/utils/async-handlers';
import type { calendar_v3 } from 'googleapis';
import { eventsHandler } from '@/utils/handle-events';
import { formatEventData } from './agent-utils';

export const executionTools = {
  validateUser: asyncHandler(async ({ email }: { email: string }) => {
    const { data, error } = await SUPABASE.from('calendars_of_users').select(TOKEN_FIELDS).eq('email', email.trim().toLowerCase());
    if (error) {
      throw error;
    }
    return data;
  }),

  validateEventFields: asyncHandler((params: calendar_v3.Schema$Event) => {
    const eventData = formatEventData(params);
    return eventData;
  }),

  updateEvent: asyncHandler((params: calendar_v3.Schema$Event) => {
    const eventData: calendar_v3.Schema$Event = formatEventData(params);
    return eventsHandler(null, ACTION.UPDATE, eventData);
  }),

  insertEvent: asyncHandler((params: calendar_v3.Schema$Event) => {
    const eventData: calendar_v3.Schema$Event = formatEventData(params);
    return eventsHandler(null, ACTION.INSERT, eventData);
  }),

  getEvent: asyncHandler(() => {
    return eventsHandler(null, ACTION.GET);
  }),

  getCalendarTypes: asyncHandler(async () => {
    const r = await CALENDAR.calendarList.list();
    const allCalendars = r.data.items?.map((item) => item.summary);
    return allCalendars;
  }),

  deleteEvent: asyncHandler((params: Record<string, string>) => {
    if (!params.eventId) {
      throw new Error('Event ID or name is missing to delete event.');
    }
    const eventData = {
      Id: params.eventId,
    };
    return eventsHandler(null, ACTION.DELETE, eventData);
  }),
};
