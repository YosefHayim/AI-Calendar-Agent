import type { User } from '@supabase/supabase-js';
import type { Request } from 'express';
import { requestConfigBase, SUPABASE } from '@/config/root-config';
import { ACTION, type SCHEMA_EVENT_PROPS, STATUS_RESPONSE } from '@/types';
import { asyncHandler } from './async-handlers';
import errorTemplate from './error-template';
import { getEventDurationString } from './get-event-duration-string';
import { initCalendarWithUserTokens } from './init-calendar-with-user-tokens';
import { TOKEN_FIELDS } from './storage';

export const handleEvents = asyncHandler(
  async (
    req: Request | null,
    action: ACTION,
    eventData?: SCHEMA_EVENT_PROPS,
    extra?: any
  ): Promise<any> => {
    let user: User | undefined;
    let credentials;

    // Optional request handling
    if (req && (req as any).user) {
      user = (req as Request & { user: User }).user;

      const { data, error } = await SUPABASE.from('calendars_of_users')
        .select(TOKEN_FIELDS)
        .eq('email', user.email!);

      if (error || !data || data.length === 0) {
        throw new Error(
          `Could not fetch credentials for user: ${error?.message || 'No data'}`
        );
      }

      credentials = data[0];
    }

    // Fallback: if no credentials, throw
    if (!credentials) {
      throw new Error('No user credentials available for calendar operation.');
    }

    const calendar = await initCalendarWithUserTokens(credentials);
    const calendarEvents = calendar.events;
    let result;

    if (
      (action === ACTION.UPDATE || action === ACTION.DELETE) &&
      !eventData?.id
    ) {
      throw errorTemplate(
        'Event ID is required for update or delete action',
        STATUS_RESPONSE.BAD_REQUEST
      );
    }

    switch (action) {
      case ACTION.GET: {
        const events = await calendarEvents.list({
          ...requestConfigBase,
          prettyPrint: true,
          maxResults: 2500,
          ...extra,
        });

        result = events.data.items
          ?.map((event: any) => ({
            eventId: event.id,
            summary: event.summary,
            durationOfEvent: getEventDurationString(
              event.start.date || event.start?.dateTime,
              event.end.date || event.end?.dateTime
            ),
            description: event.description,
            location: event.location,
            start: event.start.date || event.start?.dateTime, // for sorting
          }))
          .sort(
            (a: any, b: any) =>
              new Date(a.start).getTime() - new Date(b.start).getTime()
          );

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
          eventId: eventData!.id!,
          requestBody: eventData,
        });
        break;

      case ACTION.DELETE:
        result = await calendarEvents.delete({
          ...requestConfigBase,
          eventId: eventData!.id!,
        });
        break;

      default:
        throw errorTemplate(
          'Unsupported calendar action',
          STATUS_RESPONSE.BAD_REQUEST
        );
    }
    return result;
  }
);
