import { Action, SchemaEventProps } from '../types';
import { calendar, requestConfigBase } from '../config/root-config';

import asyncHandler from '../utils/async-handler';
import { calendar_v3 } from 'googleapis';
import { handleEvents } from '../utils/handler-calendar-event';
import sendR from '../utils/sendR';

const getAllCalendars = asyncHandler(async (req, res) => {
  const r = await calendar.calendarList.list();

  const allCalendars = r.data.items?.map((item) => item.summary);
  sendR(res)(200, 'Successfully recieved your current calendars', allCalendars);
});

const getSpecificEvent = asyncHandler(async (req, res) => {
  const r = await calendar.events.get({ ...requestConfigBase, eventId: req.params.eventId });

  if (r) sendR(res)(200, 'Event retrieved successfully', r.data);
  else sendR(res)(404, 'Event not found');
});

const getAllEvents = asyncHandler(async (req, res) => {
  const r: calendar_v3.Schema$CalendarList = await handleEvents(res, Action.GET);

  if (r) sendR(res)(200, 'Successfully retrieved all events', r);
  else sendR(res)(404, 'No events found');
});

const createEvent = asyncHandler(async (req, res) => {
  const event: SchemaEventProps = req.body;
  const r = await handleEvents(res, Action.INSERT, event);

  if (r) sendR(res)(201, 'Event created successfully', r.data);
  else sendR(res)(400, 'Failed to create event');
});

const updateEvent = asyncHandler(async (req, res) => {
  const event: SchemaEventProps = req.body;
  const r = await handleEvents(res, Action.UPDATE, { id: req.params.eventId, ...event });

  if (r) sendR(res)(200, 'Event updated successfully', r.data);
  else sendR(res)(400, 'Failed to update event');
});

const deleteEvent = asyncHandler(async (req, res) => {
  const r = await handleEvents(res, Action.DELETE, { id: req.params.eventId });

  if (r) sendR(res)(204, 'Event deleted successfully', r.data);
  else sendR(res)(400, 'Failed to delete event');
});

const calendarController = {
  getAllCalendars,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getSpecificEvent,
};

export default calendarController;
