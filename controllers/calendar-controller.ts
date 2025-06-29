import { Action, SchemaEventProps } from '../types';
import { calendar, requestConfigBase } from '../config/root-config';

import asyncHandler from '../utils/async-handler';
import { handleEvents } from '../utils/handler-calendar-event';
import sendR from '../utils/sendR';

const getAllCalendars = asyncHandler(async (req, res) => {
  const r = await calendar.calendarList.list();

  const allCalendars = r.data.items?.map((item) => item.summary);
  sendR(res)(200, 'Successfully recieved your current calendars', allCalendars);
});

const getSpecificEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id;
  const r = await calendar.events.get({ ...requestConfigBase, eventId });
  if (r) sendR(res)(200, 'Event retrieved successfully', r.data);
  else sendR(res)(404, 'Event not found');
});

const getAllEvents = asyncHandler(async (req, res) => {
  await handleEvents(res, Action.GET);
});

const createEvent = asyncHandler(async (req, res) => {
  const event: SchemaEventProps = req.body;
  handleEvents(res, Action.INSERT, event);
});

const updateEvent = asyncHandler(async (req, res) => {
  const event: SchemaEventProps = req.body;
  handleEvents(res, Action.UPDATE, event);
});

const deleteEvent = asyncHandler(async (req, res) => {
  const eventId = req.params.id;

  handleEvents(res, Action.DELETE, { id: eventId });
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
