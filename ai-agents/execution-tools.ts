import type { calendar_v3 } from 'googleapis';
import isEmail from 'validator/lib/isEmail';
import { SUPABASE } from '@/config/root-config';
import { ACTION } from '@/types';
import { asyncHandler } from '@/utils/async-handlers';
import { fetchCredentialsByEmail } from '@/utils/get-user-calendar-tokens';
import { eventsHandler } from '@/utils/handle-events';
import { initCalendarWithUserTokensAndUpdateTokens } from '@/utils/init-calendar-with-user-tokens-and-update-tokens';
import { TOKEN_FIELDS } from '@/utils/storage';
import { formatEventData } from './agent-utils';

type Event = calendar_v3.Schema$Event;

function coerceArgs(raw: unknown) {
  // 1) accept stringified input
  const base = typeof (raw as { input?: string })?.input === 'string' ? safeParse((raw as { input: string }).input) : raw;

  // 2) unwrap common nestings
  const outer = base?.fullEventParameters ?? base;
  const inner = outer?.eventParameters ?? base?.eventParameters ?? base;

  // 3) collect fields
  const email = base?.email ?? outer?.email ?? inner?.email;
  const calendarId = outer?.calendarId ?? base?.calendarId;
  const eventId = base?.eventId ?? outer?.eventId;

  // 4) extract event fields (summary/start/end/…)
  const eventLike: Partial<Event> = {
    id: inner?.id,
    summary: inner?.summary,
    description: inner?.description,
    location: inner?.location,
    attendees: inner?.attendees,
    reminders: inner?.reminders,
    recurrence: inner?.recurrence,
    colorId: inner?.colorId,
    conferenceData: inner?.conferenceData,
    transparency: inner?.transparency,
    visibility: inner?.visibility,
    start: inner?.start,
    end: inner?.end,
  };

  return { email, calendarId, eventId, eventLike };
}

function safeParse(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}

export const EXECUTION_TOOLS = {
  validateUser: asyncHandler(async ({ email }: { email: string }) => {
    const { data, error } = await SUPABASE.from('calendars_of_users').select(TOKEN_FIELDS).eq('email', email.trim().toLowerCase());
    if (error) {
      throw error;
    }
    return data;
  }),

  validateEventFields: asyncHandler((params: calendar_v3.Schema$Event & { email: string }) => {
    const { email, eventLike } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error('Invalid email address.');
    }
    const formatted = formatEventData(eventLike as Event);
    return { ...formatted, email };
  }),

  insertEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string }) => {
    const { email, calendarId, eventLike } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error('Invalid email address.');
    }
    const eventData: Event = formatEventData(eventLike as Event);
    return eventsHandler(null, ACTION.INSERT, eventData, { email, calendarId: calendarId ?? 'primary' });
  }),

  updateEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string }) => {
    const { email, calendarId, eventId, eventLike } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error('Invalid email address.');
    }
    if (!eventId) {
      throw new Error('eventId is required for update.');
    }
    const eventData: Event = { ...formatEventData(eventLike as Event), id: eventId };
    return eventsHandler(null, ACTION.UPDATE, eventData, { email, calendarId: calendarId ?? 'primary' });
  }),

  getEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string; timeMin?: string | null }) => {
    const startOfYear = new Date().toISOString().split('T')[0];

    const { email, calendarId } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error('Invalid email address.');
    }
    // list extra is passed via extra; eventsHandler uses it for list()
    return eventsHandler(null, ACTION.GET, {}, { email, calendarId: calendarId ?? 'primary', timeMin: params.timeMin || startOfYear });
  }),

  getCalendarTypesByEventDetails: asyncHandler(async (params: calendar_v3.Schema$Event & { email: string }) => {
    const { email } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error('Invalid email address.');
    }
    const tokenProps = await fetchCredentialsByEmail(email);
    const CALENDAR = await initCalendarWithUserTokensAndUpdateTokens(tokenProps);
    const r = await CALENDAR.calendarList.list();
    return r.data.items?.map((item) => item.summary);
  }),

  deleteEvent: asyncHandler((params: calendar_v3.Schema$Event & { email: string }) => {
    const { email, eventId } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error('Invalid email address.');
    }
    if (!eventId) {
      throw new Error('Event ID is required to delete event.');
    }
    return eventsHandler(null, ACTION.DELETE, { id: eventId }, { email });
  }),
  getUserDefaultTimeZone: asyncHandler(async (params: { email: string }) => {
    const { email } = coerceArgs(params);
    if (!(email && isEmail(email))) {
      throw new Error('Invalid email address.');
    }
    const tokenProps = await fetchCredentialsByEmail(email);
    const CALENDAR = await initCalendarWithUserTokensAndUpdateTokens(tokenProps);
    const r = await CALENDAR.settings.get({ setting: 'timezone' });
    return r;
  }),
};
