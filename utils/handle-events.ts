import type { User } from '@supabase/supabase-js';
import type { Request } from 'express';
import type { calendar_v3 } from 'googleapis';
import { requestConfigBase, SUPABASE } from '@/config/root-config';
import { ACTION, type SCHEMA_EVENT_PROPS, STATUS_RESPONSE, type TokensProps } from '@/types';
import { asyncHandler } from './async-handlers';
import errorTemplate from './error-template';
import { getEventDurationString } from './get-event-duration-string';
import { initCalendarWithUserTokens } from './init-calendar-with-user-tokens';
import { TOKEN_FIELDS } from './storage';

export const eventsHandler = asyncHandler(
  async (req?: Request | null, action?: ACTION, eventData?: SCHEMA_EVENT_PROPS | Record<string, string>, extra?: Record<string, unknown>): Promise<unknown> => {
    let user: User | undefined;
    let credentials!: TokensProps;

    // Optional request handling
    if (req && (req as Request & { user: User }).user) {
      user = (req as Request & { user: User }).user;

      const { data, error } = await SUPABASE.from('calendars_of_users')
        .select(TOKEN_FIELDS)
        .eq('email', user.email || '');

      if (error || !data || data.length === 0) {
        throw new Error(`Could not fetch credentials for user: ${error?.message || 'No data'}`);
      }

      credentials = data[0] as TokensProps;
    }

    if (!credentials) {
      throw new Error('No user credentials available for calendar operation.');
    }

    const calendar = initCalendarWithUserTokens(credentials);
    const calendarEvents = calendar.events;
    let result: unknown;

    if ((action === ACTION.UPDATE || action === ACTION.DELETE) && !eventData?.id) {
      throw errorTemplate('Event ID is required for update or delete action', STATUS_RESPONSE.BAD_REQUEST);
    }

    switch (action) {
      case ACTION.GET: {
        const events = await calendarEvents.list({
          ...requestConfigBase,
          prettyPrint: true,
          maxResults: 2500,
          ...extra,
        });

        const totalEventsFound =
          events.data.items?.map((event: calendar_v3.Schema$Event) => ({
            eventId: event.id || 'No ID',
            summary: event.summary || 'Untitled Event',
            durationOfEvent: getEventDurationString(event.start?.date || (event.start?.dateTime as string), event.end?.date || (event.end?.dateTime as string)),
            description: event.description || null,
            location: event.location || null,
          })) ||
          [].sort(
            (a: { start: string | null | undefined }, b: { start: string | null | undefined }) =>
              new Date(a.start as string).getTime() - new Date(b.start as string).getTime()
          );
        result = { totalNumberOfEventsFound: totalEventsFound.length, totalEventsFound };
        break;
      }

      case ACTION.INSERT:
        result = await calendarEvents.insert({
          ...requestConfigBase,
          requestBody: eventData,
        });
        break;

      case ACTION.UPDATE:
        result = await calendarEvents.update({
          ...requestConfigBase,
          eventId: eventData?.id || '',
          requestBody: eventData,
        });
        break;

      case ACTION.DELETE:
        result = await calendarEvents.delete({
          ...requestConfigBase,
          eventId: eventData?.id || '',
        });
        break;

      default:
        throw errorTemplate('Unsupported calendar action', STATUS_RESPONSE.BAD_REQUEST);
    }
    return result;
  }
);
