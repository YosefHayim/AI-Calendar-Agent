import { calendar, oauth2Client } from '../config/oauth-config';

import CREDENTIALS from '../CREDENTIALS.json';
import { asyncHandler } from '../utils/async-handler';
import calendarApi from '../utils/calendarApi';
import { calendar_v3 } from 'googleapis';
import throwHttpError from '../utils/error-template';

if (!CREDENTIALS.access_token) throwHttpError('No access token. Authenticate first.', 401);
oauth2Client.setCredentials(CREDENTIALS);

const getAllCalendars = asyncHandler(async (req, res) => {
  const result = await calendar.calendarList.list();

  res
    .status(200)
    .json({ status: 'success', message: 'All your current calendars', data: result.data });
});

const createEvent = asyncHandler(async (req, res) => {
  const event: calendar_v3.Schema$Event = req.body.event;

  if (Object.values(event).some((ev) => ev === null || ev === undefined)) {
    return res.status(404).json({
      status: 'Failed',
      message: 'Bad request, some of the event fields are null or undefined',
      dataRecieved: event,
    });
  }

  calendarApi(res, event);
});

const updateEvent = asyncHandler(async (req, res) => {});

const calendarController = {
  getAllCalendars,
  createEvent,
  updateEvent,
};

export default calendarController;
