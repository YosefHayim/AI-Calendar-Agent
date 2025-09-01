import type { Request } from 'express';
import type { calendar_v3 } from 'googleapis';
import { requestConfigBase } from '@/config/root-config';
import { ACTION, type AuthedRequest, type SCHEMA_EVENT_PROPS, STATUS_RESPONSE } from '@/types';
import { asyncHandler } from './async-handlers';
import errorTemplate from './error-template';
import { getEventDurationString } from './get-event-duration-string';
import { fetchCredentialsByEmail } from './get-user-calendar-tokens';
import { initCalendarWithUserTokensAndUpdateTokens } from './init-calendar-with-user-tokens-and-update-tokens';

export const eventsHandler = asyncHandler(
  async (req?: Request | null, action?: ACTION, eventData?: SCHEMA_EVENT_PROPS | Record<string, string>, extra?: Record<string, unknown>) => {
    const email = (req as AuthedRequest | undefined)?.user?.email ?? (typeof extra?.email === 'string' ? (extra.email as string) : undefined);
    if (!email) {
      throw errorTemplate('Email is required to resolve calendar credentials', STATUS_RESPONSE.BAD_REQUEST);
    }

    const credentials = await fetchCredentialsByEmail(email);
    const calendar = await initCalendarWithUserTokensAndUpdateTokens(credentials);
    const calendarEvents = calendar.events;

    if ((action === ACTION.UPDATE || action === ACTION.DELETE) && !eventData?.id) {
      throw errorTemplate('Event ID is required for update or delete action', STATUS_RESPONSE.BAD_REQUEST);
    }

    let result: unknown;

    switch (action) {
      case ACTION.GET: {
        const { email: _omit, ...listExtra } = extra ?? {};
        if (listExtra.q === undefined || listExtra.q === '' || listExtra.q === null) {
          listExtra.q = null;
        }
        const events = await calendarEvents.list({
          ...requestConfigBase,
          prettyPrint: true,
          maxResults: 2500,
          ...listExtra,
        });
        if (extra?.customEvents ?? false) {
          const items = events.data.items?.reverse() ?? [];
          const totalEventsFound = items.map((event: calendar_v3.Schema$Event) => {
            const startRaw = event.start?.date || event.start?.dateTime || null;
            const endRaw = event.end?.date || event.end?.dateTime || null;
            return {
              eventId: event.id || 'No ID',
              summary: event.summary || 'Untitled Event',
              durationOfEvent: startRaw && endRaw ? getEventDurationString(startRaw as string, endRaw as string) : null,
              description: event.description || null,
              location: event.location || null,
              start: startRaw as string | null,
            };
          });
          result = { totalNumberOfEventsFound: totalEventsFound.length, totalEventsFound };
        }
        result = events.data;
        break;
      }
      case ACTION.INSERT: {
        const calendarId = (extra?.calendarId as string) || 'primary';
        result = await calendarEvents.insert({
          ...requestConfigBase,
          calendarId,
          requestBody: eventData,
        });
        break;
      }
      case ACTION.UPDATE: {
        const resp = await calendarEvents.update({
          ...requestConfigBase,
          eventId: eventData?.id || '',
          ...eventData,
        });
        result = resp.data;
        break;
      }
      case ACTION.DELETE: {
        const resp = await calendarEvents.delete({
          ...requestConfigBase,
          eventId: eventData?.id || '',
        });
        result = resp.data;
        break;
      }
      default:
        throw errorTemplate('Unsupported calendar action', STATUS_RESPONSE.BAD_REQUEST);
    }
    return result;
  }
);
