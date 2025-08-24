import type { calendar_v3 } from 'googleapis';
import isEmail from 'validator/lib/isEmail';
import { SUPABASE } from '@/config/root-config';
import { ACTION } from '@/types';
import { asyncHandler } from '@/utils/async-handlers';
import { fetchCredentialsByEmail } from '@/utils/get-user-calendar-tokens';
import { eventsHandler } from '@/utils/handle-events';
import { initCalendarWithUserTokens } from '@/utils/init-calendar-with-user-tokens';
import { TOKEN_FIELDS } from '@/utils/storage';
import { formatEventData } from './agent-utils';

export const EXECUTION_TOOLS = {
  validateUser: asyncHandler(async ({ email }: { email: string }) => {
    const { data, error } = await SUPABASE.from('calendars_of_users').select(TOKEN_FIELDS).eq('email', email.trim().toLowerCase());
    if (error) {
      throw error;
    }
    return data;
  }),

  validateEventFields: asyncHandler((params: calendar_v3.Schema$Event & { email: string }) => {
    if (!isEmail(params.email)) {
      throw new Error('Invalid email address.');
    }

    return {
      ...formatEventData(params),
      email: params.email,
    };
  }),

  updateEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string }) => {
    const eventData: calendar_v3.Schema$Event = formatEventData(params);
    return eventsHandler(null, ACTION.UPDATE, eventData, { email: params.email });
  }),

  insertEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string }) => {
    const eventData: calendar_v3.Schema$Event = formatEventData(params);
    return eventsHandler(null, ACTION.INSERT, eventData, { email: params.email });
  }),

  getEvent: asyncHandler((params: { email: string }) => {
    return eventsHandler(null, ACTION.GET, {}, { email: params.email });
  }),

  getCalendarTypesByEventDetails: asyncHandler(async (params: calendar_v3.Schema$Event & { email: string }) => {
    const tokenProps = await fetchCredentialsByEmail(params.email);
    const CALENDAR = await initCalendarWithUserTokens(tokenProps);
    const r = await CALENDAR.calendarList.list();
    const allCalendars = r.data.items?.map((item) => item.summary);
    return allCalendars;
  }),

  deleteEvent: asyncHandler((params: Record<string, string> & { email: string }) => {
    if (!params.eventId) {
      throw new Error('Event ID or name is missing to delete event.');
    }
    const eventData = { id: params.eventId };
    return eventsHandler(null, ACTION.DELETE, eventData, { email: params.email });
  }),
};
