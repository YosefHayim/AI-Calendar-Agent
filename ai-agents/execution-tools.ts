import type { calendar_v3 } from 'googleapis';
import { CALENDAR, SUPABASE } from '@/config/root-config';
import { ACTION } from '@/types';
import { asyncHandler } from '@/utils/async-handlers';
import { handleEvents } from '@/utils/handle-events';
import { TOKEN_FIELDS } from '@/utils/storage';
import { formatEventData } from './agent-utils';

export const executionTools = {
  validateUser: asyncHandler(async ({ email }: { email: string }) => {
    const { data, error } = await SUPABASE.from('calendars_of_users')
      .select(TOKEN_FIELDS)
      .eq('email', email.trim().toLowerCase());
    if (error) {
      throw error;
    }
    return data;
  }),

  validateEventFields: asyncHandler(async (params) => {
    const eventData: calendar_v3.Schema$Event = formatEventData(params);
    return eventData;
  }),

  updateEvent: asyncHandler(async (params: calendar_v3.Schema$Event) => {
    const eventData: calendar_v3.Schema$Event = formatEventData(params);
    return handleEvents(ACTION.UPDATE, eventData);
  }),

  insertEvent: asyncHandler(async (params: calendar_v3.Schema$Event) => {
    const eventData: calendar_v3.Schema$Event = formatEventData(params);
    return handleEvents(ACTION.INSERT, eventData);
  }),

  getEvent: asyncHandler(async () => {
    handleEvents(ACTION.GET);
  }),

  getCalendarTypes: asyncHandler(async () => {
    const r = await CALENDAR.calendarList.list();
    const allCalendars = r.data.items?.map((item) => item.summary);
    return allCalendars;
  }),

  deleteEvent: asyncHandler(
    async (params: calendar_v3.Params$Resource$Events$Delete) => {
      return handleEvents(ACTION.DELETE, params.eventId);
    }
  ),
};
