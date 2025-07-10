import { Action, SchemaEventProps } from "../types";
import { calendar, requestConfigBase } from "../config/root-config";

import { handleEvents } from "../utils/handler-calendar-event";
import { reqResAsyncHandler } from "../utils/async-handler";
import sendR from "../utils/sendR";

const getAllCalendars = reqResAsyncHandler(async (req, res) => {
  const r = calendar.calendarList.list();

  const allCalendars = (await r).data.items?.map((item) => item.summary);
  sendR(res)(200, "Successfully recieved your current calendars", allCalendars);
});

const getSpecificEvent = reqResAsyncHandler(async (req, res) => {
  const r = await calendar.events.get({ ...requestConfigBase, eventId: req.params.eventId });

  sendR(res)(200, "Event retrieved successfully", r.data);
});

const getAllEvents = reqResAsyncHandler(async (req, res) => {
  const r = handleEvents(res, Action.GET);

  sendR(res)(200, "Successfully retrieved all events", r);
});

const createEvent = reqResAsyncHandler(async (req, res) => {
  const event: SchemaEventProps = req.body;
  const r = handleEvents(res, Action.INSERT, event);

  sendR(res)(201, "Event created successfully", r);
});

const updateEvent = reqResAsyncHandler(async (req, res) => {
  const event: SchemaEventProps = req.body;
  const r = handleEvents(res, Action.UPDATE, { id: req.params.eventId, ...event });
});

const deleteEvent = reqResAsyncHandler(async (req, res) => {
  const r = handleEvents(res, Action.DELETE, { id: req.params.eventId });
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
