import { Action, SchemaEventProps } from '../types';
import { calendar, requestConfigBase } from '../config/root-config';

import { Response } from 'express';
import errorFn from './error-template';
import formatDate from './formatDate';

export const handleEvents = async (
  res: Response,
  action: Action,
  eventData?: SchemaEventProps,
): Promise<any> => {
  try {
    const calendarEvents = calendar.events;
    let r;

    switch (action) {
      case Action.GET:
        const events = await calendarEvents.list({
          ...requestConfigBase,
          timeMin: new Date().toISOString(),
        });
        r = events.data.items
          ?.map((event) => {
            return {
              eventId: event.id,
              summary: event.summary,
              start: formatDate(event.start?.date || event.start?.dateTime),
              end: formatDate(event.end?.date || event.end?.dateTime),

              description: event.description,
              location: event.location,
            };
          })
          .sort((a, b) => {
            return new Date(a.start).getTime() - new Date(b.start).getTime();
          });
        break;

      case Action.INSERT:
        r = await calendarEvents.insert({
          ...requestConfigBase,
          requestBody: eventData,
        });
        break;

      case Action.UPDATE:
        r = await calendarEvents.update({
          ...requestConfigBase,
          eventId: eventData?.id || '',
          requestBody: eventData,
        });
        break;

      case Action.DELETE:
        r = await calendarEvents.delete({
          ...requestConfigBase,
          eventId: eventData?.id || '',
        });
        break;

      default:
        errorFn('Unsupported calendar action', 400);
    }

    if (!r) {
      errorFn('No response from calendar API', 500, res);
      return;
    }

    return r;
  } catch (error) {
    errorFn(`Internal Server Error ${error}`, 500);
  }
};
