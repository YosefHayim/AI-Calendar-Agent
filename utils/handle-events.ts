import type { Request } from 'express';
import type { calendar_v3 } from 'googleapis';
import { requestConfigBase } from '@/config/root-config';
import { ACTION, type AuthedRequest, STATUS_RESPONSE } from '@/types';
import { asyncHandler } from './async-handlers';
import errorTemplate from './error-template';
import { getEventDurationString } from './get-event-duration-string';
import { fetchCredentialsByEmail } from './get-user-calendar-tokens';
import { initCalendarWithUserTokensAndUpdateTokens } from './init-calendar-with-user-tokens-and-update-tokens';

type ListExtra = Partial<calendar_v3.Params$Resource$Events$List> & {
  email?: string;
  customEvents?: boolean;
};

export const eventsHandler = asyncHandler(
  async (req?: Request | null, action?: ACTION, eventData?: calendar_v3.Schema$Event | Record<string, string>, extra?: Record<string, unknown>) => {
    const email = (req as AuthedRequest | undefined)?.user?.email ?? (typeof extra?.email === 'string' ? (extra.email as string) : undefined);

    if (!email) {
      throw new Error('Email is required to resolve calendar credentials');
    }

    const credentials = await fetchCredentialsByEmail(email);
    const calendar = await initCalendarWithUserTokensAndUpdateTokens(credentials);
    const calendarEvents = calendar.events;

    if ((action === ACTION.UPDATE || action === ACTION.DELETE) && !eventData?.id) {
      throw new Error('Event ID is required for update or delete action');
    }

    switch (action) {
      case ACTION.GET: {
        // Normalize extra/list params
        const rawExtra: ListExtra = { ...(extra as ListExtra), ...(req?.body ?? {}) };

        const customFlag = Boolean(rawExtra.customEvents);
        const { email: _omitEmail, customEvents: _omitCustom, ...listExtraRaw } = rawExtra;

        // Build a clean param object only with allowed fields for events.list
        const listExtra: calendar_v3.Params$Resource$Events$List = {
          ...requestConfigBase,
          prettyPrint: true,
          maxResults: 2499,
          ...listExtraRaw,
        };

        // Drop falsy q instead of sending null
        if (!listExtra.q) {
          (listExtra as Record<string, unknown>).q = undefined;
        }
        const events = await calendarEvents.list(listExtra);

        if (customFlag) {
          const items = (events.data.items ?? []).slice().reverse();
          const totalEventsFound = items.map((event: calendar_v3.Schema$Event) => {
            const startRaw = event.start?.date || event.start?.dateTime || null;
            const endRaw = event.end?.date || event.end?.dateTime || null;
            return {
              eventId: event.id || 'No ID',
              summary: event.summary || 'Untitled Event',
              description: event.description || null,
              location: event.location || null,
              durationOfEvent: startRaw && endRaw ? getEventDurationString(startRaw as string, endRaw as string) : null,
              start: (startRaw as string) || null,
              end: endRaw || null,
            };
          });
          return { totalNumberOfEventsFound: totalEventsFound.length, totalEventsFound };
        }

        return events.data;
      }

      case ACTION.INSERT: {
        const body = (eventData as calendar_v3.Schema$Event & { calendarId?: string; email?: string }) || {};
        const calendarId = (extra?.calendarId as string) || body.calendarId || 'primary';

        const { calendarId: _cid, email: _email, ...requestBody } = body;

        const createdEvent = await calendarEvents.insert({
          ...requestConfigBase,
          calendarId,
          requestBody,
        });
        return createdEvent.data;
      }

      case ACTION.UPDATE: {
        const resp = await calendarEvents.update({
          ...requestConfigBase,
          eventId: (eventData?.id as string) || '',
          requestBody: eventData,
        });
        return resp.data;
      }

      case ACTION.DELETE: {
        const resp = await calendarEvents.delete({
          ...requestConfigBase,
          eventId: (eventData?.id as string) || '',
        });
        return resp.data;
      }

      default:
        throw errorTemplate('Unsupported calendar action', STATUS_RESPONSE.BAD_REQUEST);
    }
  }
);
