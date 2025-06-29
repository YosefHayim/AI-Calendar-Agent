import { Action, SchemaEventProps } from '../types';
import { calendar, requestConfigBase } from '../config/root-config';

import { Response } from 'express';
import errorFn from './error-template';
import sendR from './sendR';

export const handleEvents = async (
  res: Response,
  action: Action,
  eventData?: SchemaEventProps,
): Promise<void> => {
  try {
    const calendarEvents = calendar.events;
    let r;

    switch (action) {
      case Action.GET:
        r = await calendarEvents.list({
          ...requestConfigBase,
          timeMin: new Date().toISOString(),
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
          requestBody: eventData,
        });
        break;

      case Action.DELETE:
        if (eventData && !eventData.id) {
          errorFn('Event ID is required for deletion', 400, res);
          return;
        }
        r = await calendarEvents.delete({
          ...requestConfigBase,
          eventId: eventData?.id || '',
        });
        break;

      default:
        errorFn('Unsupported calendar action', 400);
    }

    sendR(res)(200, 'Event operation completed successfully', r?.data);
  } catch (error) {
    errorFn(`Internal Server Error ${error}`, 500);
  }
};
