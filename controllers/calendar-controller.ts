import type { User } from '@supabase/supabase-js';

import type { Request } from 'express';
import type { calendar_v3 } from 'googleapis';
import { requestConfigBase } from '@/config/root-config';
import { ACTION, STATUS_RESPONSE } from '@/types';
import { reqResAsyncHandler } from '@/utils/async-handlers';
import { getUserCalendarTokens } from '@/utils/get-user-calendar-tokens';
import { handleEvents } from '@/utils/handle-events';
import { initCalendarWithUserTokens } from '@/utils/init-calendar-with-user-tokens';
import sendR from '@/utils/send-response';

const getAllCalendars = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await getUserCalendarTokens('email', user);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, 'User credentials not found.');
  }

  const calendar = initCalendarWithUserTokens(tokenData);
  const r = await calendar.calendarList.list();
  const allCalendars = r.data.items?.map((item: calendar_v3.Schema$CalendarListEntry) => item.summary);

  sendR(res, STATUS_RESPONSE.SUCCESS, 'Successfully received your current calendars', allCalendars);
});

const getSpecificEvent = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await getUserCalendarTokens('email', user);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, 'User token not found.');
  }

  const calendar = initCalendarWithUserTokens(tokenData);
  const r = await calendar.events.get({
    ...requestConfigBase,
    eventId: req.params.eventId,
  });

  sendR(res, STATUS_RESPONSE.SUCCESS, 'Event retrieved successfully', r.data);
});

const getAllEvents = reqResAsyncHandler(async (req, res) => {
  const r = await handleEvents(req, ACTION.GET);
  sendR(res, STATUS_RESPONSE.SUCCESS, 'Successfully retrieved all events', r);
});

const getAllFilteredEvents = reqResAsyncHandler(async (req, res) => {
  const r = await handleEvents(req, ACTION.GET, undefined, req.query);
  sendR(res, STATUS_RESPONSE.SUCCESS, 'Successfully retrieved all filtered events', r);
});

const createEvent = reqResAsyncHandler(async (req, res) => {
  const r = await handleEvents(req, ACTION.INSERT, req.body);
  sendR(res, STATUS_RESPONSE.CREATED, 'Event created successfully', r);
});

const updateEvent = reqResAsyncHandler(async (req, res) => {
  const r = await handleEvents(req, ACTION.UPDATE, {
    id: req.params.eventId,
    ...req.body,
  });
  sendR(res, STATUS_RESPONSE.NOT_FOUND, 'Event updated successfully', r);
});

const deleteEvent = reqResAsyncHandler(async (req, res) => {
  const r = await handleEvents(req, ACTION.DELETE, { id: req.params.eventId });
  sendR(res, STATUS_RESPONSE.NOT_FOUND, 'Event deleted successfully', r);
});

export default {
  getAllCalendars,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getSpecificEvent,
  getAllFilteredEvents,
};
