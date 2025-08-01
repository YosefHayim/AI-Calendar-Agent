import { ACTION, SCHEMA_EVENT_PROPS, STATUS_CODES } from "../types";
import { CALENDAR, requestConfigBase } from "../config/root-config";

import { handleEvents } from "../utils/handler-calendar-event";
import { reqResAsyncHandler } from "../utils/async-handler";
import sendR from "../utils/sendR";

const getAllCalendars = reqResAsyncHandler(async (req, res) => {
  const r = CALENDAR.calendarList.list();

  const allCalendars = (await r).data.items?.map((item) => item.summary);
  sendR(res)(STATUS_CODES.SUCCESS, "Successfully received your current calendars", allCalendars);
});

const getSpecificEvent = reqResAsyncHandler(async (req, res) => {
  const r = await CALENDAR.events.get({ ...requestConfigBase, eventId: req.params.eventId });
  sendR(res)(STATUS_CODES.SUCCESS, "Event retrieved successfully", r.data);
});

const getAllEvents = reqResAsyncHandler(async (req, res) => {
  const r = handleEvents(res, ACTION.GET);
  sendR(res)(STATUS_CODES.SUCCESS, "Successfully retrieved all events", r);
});

const createEvent = reqResAsyncHandler(async (req, res) => {
  const event: SCHEMA_EVENT_PROPS = req.body;
  const r = handleEvents(res, ACTION.INSERT, event);
  sendR(res)(STATUS_CODES.CREATED, "Event created successfully", r);
});

const updateEvent = reqResAsyncHandler(async (req, res) => {
  const event: SCHEMA_EVENT_PROPS = req.body;
  const r = handleEvents(res, ACTION.UPDATE, { id: req.params.eventId, ...event });
  sendR(res)(STATUS_CODES.NOT_FOUND, "Event has been successfully updated", r);
});

const deleteEvent = reqResAsyncHandler(async (req, res) => {
  const r = handleEvents(res, ACTION.DELETE, { id: req.params.eventId });
  sendR(res)(STATUS_CODES.NOT_FOUND, "Event has been successfully deleted", r);
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
