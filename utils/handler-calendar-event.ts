import { Action, eventDataRequest } from '../types';
import { calendar, oauth2Client, requestConfigBase } from '../config/oauth-config';

import { Response } from 'express';

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
        result = await calendarEvents.list(requestConfigBase);
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
        res.status(400).json({
          status: 'error',
          message: 'Unsupported calendar action',
        });
    }

    res.status(200).json({
      status: 'success',
      message: 'Event operation completed successfully',
      data: result?.data,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Something went wrong',
    });
  }
};
