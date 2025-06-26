import { Action, eventDataRequest } from '../types';
import { calendar, requestConfigBase } from '../config/root-config';

import { Response } from 'express';
import throwHttpError from './error-template';

export const handleCalendarEvent = async (
  res: Response,
  action: Action,
  eventData?: eventDataRequest,
): Promise<void> => {
  try {
    const calendarEvents = calendar.events;
    let result;

    switch (action) {
      case 'get':
        const timeMin = new Date();
        timeMin.setDate(timeMin.getDate() - 10);

        result = await calendarEvents.list({
          ...requestConfigBase,
          calendarId: 'primary',
          timeMin: timeMin.toISOString(),
        });
        break;

      case 'insert':
        result = await calendarEvents.insert({
          ...requestConfigBase,
          requestBody: eventData,
        });
        break;

      case 'update':
        result = await calendarEvents.update({
          ...requestConfigBase,
          eventId: eventData?.id!, // required for update
          requestBody: eventData,
        });
        break;

      default:
        throwHttpError('Unsupported calendar action', 400);
    }

    res.status(200).json({
      status: 'success',
      message: 'Event operation completed successfully',
      data: result?.data,
    });
  } catch (error: any) {
    throwHttpError(error.message || 'Internal Server Error', 500);
  }
};
