import { ACTION, SCHEMA_EVENT_PROPS, STATUS_RESPONSE } from "../types";

import { Request } from "express";
import { User } from "@supabase/supabase-js";
import { getUserCalendarTokens } from "../utils/get-user-calendar-tokens";
import { handleEvents } from "../utils/handler-calendar-event";
import { reqResAsyncHandler } from "../utils/async-handler";
import { requestConfigBase } from "../config/root-config";
import sendR from "../utils/sendR";
import { setAuthSpecificUserAndCalendar } from "../utils/set-credentials-oauth-specific-user";

const getAllCalendars = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await getUserCalendarTokens(user, "email");
  if (!tokenData) return sendR(res)(STATUS_RESPONSE.NOT_FOUND, "User token not found.");

  const calendar = await setAuthSpecificUserAndCalendar(tokenData);
  const r = await calendar.calendarList.list();
  const allCalendars = r.data.items?.map((item: any) => item.summary);

  sendR(res)(STATUS_RESPONSE.SUCCESS, "Successfully received your current calendars", allCalendars);
});

const getSpecificEvent = reqResAsyncHandler(async (req, res) => {
  const user = (req as Request & { user: User }).user;
  const tokenData = await getUserCalendarTokens(user, "email");
  if (!tokenData) return sendR(res)(STATUS_RESPONSE.NOT_FOUND, "User token not found.");

  const calendar = await setAuthSpecificUserAndCalendar(tokenData);
  const r = await calendar.events.get({ ...requestConfigBase, eventId: req.params.eventId });

  sendR(res)(STATUS_RESPONSE.SUCCESS, "Event retrieved successfully", r.data);
});

const getAllEvents = reqResAsyncHandler(async (req, res) => {
  const r = handleEvents(req, ACTION.GET);
  sendR(res)(STATUS_RESPONSE.SUCCESS, "Successfully retrieved all events", r);
});

const createEvent = reqResAsyncHandler(async (req, res) => {
  const r = handleEvents(req, ACTION.INSERT, req.body);
  sendR(res)(STATUS_RESPONSE.CREATED, "Event created successfully", r);
});

const updateEvent = reqResAsyncHandler(async (req, res) => {
  const r = handleEvents(req, ACTION.UPDATE, { id: req.params.eventId, ...req.body });
  sendR(res)(STATUS_RESPONSE.NOT_FOUND, "Event updated successfully", r);
});

const deleteEvent = reqResAsyncHandler(async (req, res) => {
  const r = handleEvents(req, ACTION.DELETE, { id: req.params.eventId });
  sendR(res)(STATUS_RESPONSE.NOT_FOUND, "Event deleted successfully", r);
});

export default {
  getAllCalendars,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  getSpecificEvent,
};
