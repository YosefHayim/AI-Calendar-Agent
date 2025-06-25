import { calendar, oauth2Client } from '../config/oauth-config';

import { Response } from 'express';
import { calendar_v3 } from 'googleapis';

const requestConfig: calendar_v3.Params$Resource$Events$Insert = {
  auth: oauth2Client,
  calendarId: 'primary',
  supportsAttachments: true,
  sendNotifications: true,
};

/**
 * Handles Google Calendar operations like insert, update, etc.
 * @res the response itself
 * @eventData the object itself of the event
 * @action crud opreations
 */
const handleCalendarEvent = (
  res: Response,
  eventData: calendar_v3.Schema$Event,
  action: 'insert' | 'update' | 'get',
): void => {
  const calendarEvents = calendar.events;

  switch (action) {
    case 'insert':
      calendarEvents.insert(requestConfig, (err, event) => {
        if (err) {
          res.status(500).send('Error inserting: ' + err.message);
          return;
        }
        res.status(201).json({
          status: 'success',
          message: 'Event created successfully',
          data: event?.data,
        });
      });
      break;

    case 'get':
      calendarEvents.get(requestConfig, (err, response) => {
        if (err) {
          res.status(500).send('Error inserting: ' + err.message);
          return;
        }
        res.status(201).json({
          status: 'success',
          message: 'Event created successfully',
          data: response?.data,
        });
      });
    case 'update':
      calendarEvents.insert(requestConfig, (err, response) => {
        if (err) {
          res.status(500).send('Error inserting: ' + err.message);
          return;
        }
        res.status(201).json({
          status: 'success',
          message: 'Event created successfully',
          data: response?.data,
        });
      });
      break;

    default:
      res.status(400).json({ status: 'error', message: 'Unsupported calendar action' });
  }
};

export default handleCalendarEvent;
